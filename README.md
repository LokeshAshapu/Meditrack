# 🏥 MediTrack

**MediTrack** is a secure and user-friendly web application for managing personal medical records. It allows users to upload, organize, and share their medical documents digitally. Built with Node.js, Express, MongoDB, and EJS, MediTrack aims to streamline healthcare documentation for both patients and medical professionals.

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Code Highlights](#code-highlights)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🚀 Features

- 🔐 **Authentication** – Secure user registration and login
- 🗂️ **Dashboard** – View, Add or delete records
- 📤 **Share via Email** – Send medical records directly to doctors
- 💻 **Responsive Design** – Mobile-friendly and accessible UI

---

## 🛠️ Tech Stack

| Category     | Technology              |
|--------------|--------------------------|
| Backend      | Node.js, Express.js      |
| Frontend     | HTML, Tailwind CSS       |
| Database     | MongoDB with Mongoose    |
| Email Service| Nodemailer               |
| Auth & Session | express-session, bcrypt |

---

## 📤 Usage

1. **Register** for a new account or **log in**.
2. **Manage** the data what you can upload.
3. **Mail Feature** mail to the users who use the tracking feature

---

## 📸 Screenshots

(📸Screen Shots here)
- Login & Registration Page  
- File Upload Interface  
- Dashboard with Records  
- Email Sharing Form  

---
##Linkedin post

[Post link](https://www.linkedin.com/posts/ashapu-lokesh_mernstack-webdevelopment-fullstackdeveloper-activity-7350487545870249985-3drD?utm_source=social_share_send&utm_medium=android_app&rcm=ACoAAEf9Wd0BOFxeqyHyVRKmHnDIIjiUEFaZLfs&utm_campaign=copy_link)



## 🧩 Code Highlights

### Uploading Files with Multer

```javascript
router.post('/upload', upload.single('record'), async (req, res) => {
  const record = new Record({
    user: req.user._id,
    filename: req.file.filename,
    originalName: req.file.originalname,
  });
  await record.save();
  res.redirect('/dashboard');
});```

