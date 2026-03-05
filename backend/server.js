/**
 * ============================================================
 *  SERVER CONFIGURATION – EXPRESS + EJS
 * ============================================================
 * 
 * Entry point of the backend application.
 * 
 * Responsibilities:
 * - Load environment variables
 * - Initialize Express server
 * - Configure EJS as view engine
 * - Serve static assets
 * - Define application routes
 * - Handle authentication action redirects
 * 
 * Environment:
 * - Development
 * - Production
 * 
 * Author: [Tu Nombre]
 * ============================================================
 */

// ------------------------------------------------------------
// 🔐 Load Environment Variables (must be first)
// ------------------------------------------------------------
import 'dotenv/config';

// ------------------------------------------------------------
// 📦 Dependencies
// ------------------------------------------------------------
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ------------------------------------------------------------
// 📁 ES Modules __dirname Fix
// ------------------------------------------------------------
/**
 * Since ES Modules do not provide __dirname by default,
 * we recreate it manually using fileURLToPath.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------
// 🚀 Initialize Express App
// ------------------------------------------------------------
const app = express();

/**
 * Use simple query parser to prevent deep object parsing
 * and reduce potential abuse via complex query strings.
 */
app.set('query parser', 'simple');

// ------------------------------------------------------------
// 🌍 Environment Variables
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Mi Proyecto';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------------------------------
// 🎨 View Engine Configuration
// ------------------------------------------------------------
/**
 * Configure EJS as template engine
 * and define views directory.
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ------------------------------------------------------------
// 📁 Static Files
// ------------------------------------------------------------
/**
 * Serve static assets from /public directory.
 * Includes CSS, client-side JS, images, etc.
 */
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// ------------------------------------------------------------
// 🌐 Global Template Variables
// ------------------------------------------------------------
/**
 * Middleware to expose global variables
 * to all EJS templates.
 */
app.use((req, res, next) => {
  res.locals.title = APP_NAME;
  res.locals.year = new Date().getFullYear();
  res.locals.env = NODE_ENV;
  next();
});

// ============================================================
// 📌 ROUTES
// ============================================================

/**
 * Authentication Action Handler
 * 
 * Handles special action links such as:
 * - Email verification
 * - Password reset
 * 
 * Expected query params:
 * - mode
 * - oobCode
 */
app.get('/auth/action', (req, res) => {
  const { mode, oobCode } = req.query;

  if (!mode || !oobCode) {
    return res.status(400).send('Invalid parameters.');
  }

  switch (mode) {
    case 'verifyEmail':
      return res.render('linkconfirm', {
        title: 'Confirm Email',
        oobCode
      });

    case 'resetPassword':
      return res.render('password', {
        title: 'Reset Password',
        oobCode
      });

    default:
      return res.status(400).send('Unsupported action.');
  }
});

// ------------------------------------------------------------
// 🏠 Main Application Routes
// ------------------------------------------------------------

app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' });
});

app.get('/account-settings', (req, res) => {
  res.render('acc&sett', { title: 'Account & Settings' });
});

app.get('/search', (req, res) => {
  res.render('search', { title: 'Search Note' });
});

app.get('/crear', (req, res) => {
  res.render('crear', { title: 'Create Note' });
});

/**
 * Edit Note Route
 * Dynamic parameter:
 * - id → Note identifier
 */
app.get('/editar/:id', (req, res) => {
  const noteId = req.params.id;
  res.render('editar', { noteId, title: 'Edit Note' });
});

// ------------------------------------------------------------
// 🔐 Authentication Pages
// ------------------------------------------------------------

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/olvidar', (req, res) => {
  res.render('olvidar', { title: 'Forgot Password' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.get('/linkconfirm', (req, res) => {
  res.render('linkconfirm', { title: 'Link Confirmation' });
});

app.get('/password', (req, res) => {
  res.render('password', { title: 'Reset Password' });
});

// ============================================================
// 🚀 SERVER INITIALIZATION
// ============================================================

/**
 * Start server and log environment-based message.
 */
app.listen(PORT, () => {
  const location =
    NODE_ENV === 'production'
      ? 'Production Environment'
      : `http://localhost:${PORT}`;

  console.log(`🚀 Server running in ${location}`);
});