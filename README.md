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
- 📁 **File Upload** – Upload medical documents (PDFs, images)
- 🗂️ **Dashboard** – View, download, or delete records
- 📤 **Share via Email** – Send medical records directly to doctors
- 💻 **Responsive Design** – Mobile-friendly and accessible UI

---

## 🛠️ Tech Stack

| Category     | Technology              |
|--------------|--------------------------|
| Backend      | Node.js, Express.js      |
| Frontend     | EJS, HTML, CSS           |
| Database     | MongoDB with Mongoose    |
| File Upload  | Multer                   |
| Email Service| Nodemailer               |
| Auth & Session | express-session, bcrypt |

---

## 📤 Usage

1. **Register** for a new account or **log in**.
2. **Upload** medical records such as prescriptions, reports, and test results.
3. **Manage** records through your personal dashboard (view, delete, download).
4. **Share** selected records securely via email to your doctor.

---

## 📸 Screenshots


- Login & Registration Page  
- File Upload Interface  
- Dashboard with Records  
- Email Sharing Form  

---

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
});
