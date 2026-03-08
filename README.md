# mynotes

**mynotes** is a full-stack note management web application built with Node.js, Express, and EJS.
It allows users to securely create, manage, organize, and store notes with authentication, user preferences, and optimized frontend performance.

Designed with clean architecture, modular structure, and production-ready practices, this project demonstrates strong backend fundamentals, modern frontend tooling, and security-conscious implementation.

## Demo

![MyNotes Demo](./demo/mynotes-demo.gif)

---

## 🚀 Live Overview

* Full authentication system (Google OAuth + Firebase Auth)
* Secure user session handling
* Notes CRUD functionality
* User-specific data isolation
* Internationalization support
* Optimized frontend build pipeline
* Environment-based configuration

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* EJS (Server-side rendering)
* Firebase Authentication
* Firestore Database
* dotenv (.env environment configuration)

### Frontend

* Vanilla JavaScript (Modular structure)
* SCSS (BEM methodology)
* SweetAlert2
* Responsive design principles

### Tooling & DevOps

* Gulp (Task automation)
* Webpack (Asset bundling)
* Nodemon (Development auto-reload)
* BrowserSync (Live browser reload)
* Git & GitHub (Version control)

---

## 📂 Project Architecture

The application follows a structured MVC-like pattern with separation of concerns:

```
mynotes/
│
├── backend/
│   └── server.js
│
├── frontend/
│   ├── js/
│   ├── scss/
│   └── assets/
│
├── views/        # EJS templates
├── public/       # Compiled static assets
├── .env          # Environment variables
├── gulpfile.js
└── webpack.config.js
```

This structure ensures scalability, maintainability, and clarity for team collaboration.

---

## 🔐 Authentication & Security

* Firebase Authentication integration (Google Sign-In)
* Firestore user document creation & synchronization
* Secure environment variable handling using `.env`
* Protection against duplicate actions (overwrite/duplicate logic handling)
* Client-server separation of concerns
* Defensive programming patterns for safer async operations

---

## 🌍 Internationalization

The application includes a modular translation system that allows dynamic language support through a centralized `i18n` implementation.

---

## ⚡ Performance & Optimization

* Webpack bundling and minification
* SCSS compilation and optimization via Gulp
* Modular frontend JavaScript architecture
* Clean DOM event delegation patterns
* Reduced redundant renders
* Structured async/await flows

---

## 🧪 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Wilfredery/mynotes-fullstack.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```
PORT=any_host
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
```

### 4. Run development server

```bash
npm run dev
```

This will start:

* Nodemon
* Gulp watcher
* Webpack bundler
* BrowserSync (if configured)

---

## 📌 Features

* Create, edit, delete, and manage notes
* Google authentication
* Overwrite / duplicate handling logic
* Account & settings management (multi-state handling)
* Custom select components
* Responsive layout
* User-based data separation
* Frontend modular architecture

---

## 🎯 Purpose of This Project

This project was built to demonstrate:

* Full-stack development proficiency
* Clean code architecture
* Secure authentication handling
* Build pipeline optimization
* Real-world production structure
* Recruiter-ready project presentation

---

## 📈 Future Improvements

* Tag system for notes
* Advanced search and filtering
* Note categorization
* Dark/light theme toggle
* API documentation
* Unit & integration testing

---

## 📄 License

This project is public and available for educational and portfolio purposes.

---

## 👤 Author

Developed by Wilfredery Dilone
Full-Stack Developer

---

If you found this project interesting, feel free to explore the code and reach out.
