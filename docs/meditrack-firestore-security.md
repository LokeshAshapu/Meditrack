# MediTrack Firestore Security Rules Architecture (Phase 4)

**Document Version:** 1.0  
**Target Environment:** Firebase Firestore Security Rules Engine  

---

## 1. Security Architecture & Rules Overview

While the Node.js Express backend validates Firebase ID Tokens and HMAC SHA-256 tokens using the Firebase Admin SDK, native Firestore Security Rules enforce defense-in-depth directly at the database layer.

---

## 2. Production `firestore.rules` Implementation

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(email) {
      return isAuthenticated() && request.auth.token.email == email;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }

    // 1. Users Collection
    match /users/{email} {
      allow read: if isAuthenticated();
      allow create: if true; // Public signup
      allow update: if isOwner(email) || isAdmin();
      allow delete: if isAdmin();
    }

    // 2. Trackers Collection (Medications)
    match /trackers/{trackerId} {
      allow read, write: if isAuthenticated() && resource.data.email == request.auth.token.email;
      allow create: if isAuthenticated() && request.resource.data.email == request.auth.token.email;
      allow delete: if isAuthenticated() && (resource.data.email == request.auth.token.email || isAdmin());
    }

    // 3. Appointments Collection
    match /appointments/{aptId} {
      allow read: if isAuthenticated() && (resource.data.patientId == request.auth.token.email || resource.data.doctorId == request.auth.token.email || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.patientId == request.auth.token.email;
      allow update, delete: if isAuthenticated() && (resource.data.patientId == request.auth.token.email || resource.data.doctorId == request.auth.token.email || isAdmin());
    }

    // 4. Chats & Subcollection Messages
    match /chats/{chatId} {
      allow read, write: if isAuthenticated() && (request.auth.token.email in resource.data.participants);
      
      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
    }

    // 5. Immutable Audit Logs (Read-only for Admin, Write from Backend Admin SDK)
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only Firebase Admin SDK (backend) can write audit logs
    }

    // 6. User Feedback Collection
    match /user_feedback/{feedbackId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }

    // 7. Emergency SOS Events Collection
    match /sos_events/{eventId} {
      allow read: if isAuthenticated() && (resource.data.email == request.auth.token.email || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.email == request.auth.token.email;
    }
  }
}
```
