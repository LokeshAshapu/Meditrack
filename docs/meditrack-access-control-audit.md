# MediTrack Access Control & Routing Audit (Phase 1)

**Audit Date:** August 21, 2026  
**Auditor:** Healthcare SaaS & Security Engineering Team  

---

## 1. Route Classification Audit

### 1.1 Public Unauthenticated Routes
- `/about` (Primary Public Landing Page)
- `/login` (Authentication Login)
- `/signup` & `/register` (User & Physician Registration)

### 1.2 Protected Patient Routes (Requires Auth & `patient` / `admin` Role)
- `/dashboard` (Patient Healthcare Journey & Checklist)
- `/tracker` (Medication Reminder Setup)
- `/find-doctors` (Verified Physician Directory & Appointment Booking)
- `/messages` (Encrypted Patient-Doctor Chat)
- `/privacy-center` (Data Controls & Local Vault Export)

### 1.3 Role-Protected Doctor Routes (Requires Auth & `doctor` Role)
- `/doctor-dashboard` (Physician Portal, Availability Hours, Consultation Queue)
- `/doctor-profile` (Physician Specialization & Credentials Profile)

### 1.4 Role-Protected Admin Routes (Requires Auth & `admin` Role)
- `/admin` & `/admin-dashboard` (Commercial & Pilot Control Center, Doctor Verification Center 2.0, System Observability, Audit Logs)

---

## 2. Access Control Architecture

1. **Frontend Route Guards**: Reusable `ProtectedRoute` component enforcing `authToken` presence and `allowedRoles` checks. Redirects unauthenticated visitors to `/login?redirect=...`.
2. **Access Restricted Page**: Renders an error notice for authenticated users attempting to access unauthorized role endpoints.
3. **Backend Middleware Guards**: Centralized `authenticateToken` middleware and `requireRole(['patient', 'doctor', 'admin'])` guards on Express API endpoints.
