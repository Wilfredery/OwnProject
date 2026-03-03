// backend/server.js

// 🔐 Cargar variables de entorno (siempre primero)
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario en ES Modules para simular __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔐 Limita el parser de query (evita qs profundo)
app.set('query parser', 'simple');

// 🌍 Variables de entorno
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Mi Proyecto';
const NODE_ENV = process.env.NODE_ENV || 'development';

// 🎨 Configuración de vistas con EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 📁 Archivos públicos
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// 🌐 Variables globales disponibles en todas las vistas
app.use((req, res, next) => {
  res.locals.title = APP_NAME;
  res.locals.year = new Date().getFullYear();
  res.locals.env = NODE_ENV;
  next();
});

// =====================
// 📌 Rutas
// =====================

app.get('/auth/action', (req, res) => {
  const { mode, oobCode } = req.query;

  if (!mode || !oobCode) {
    return res.status(400).send('Parámetros inválidos.');
  }

  switch (mode) {
    case 'verifyEmail':
      return res.render('linkconfirm', {
        title: 'Confirmar Email',
        oobCode
      });

    case 'resetPassword':
      return res.render('password', {
        title: 'Restablecer Contraseña',
        oobCode
      });

    default:
      return res.status(400).send('Acción no soportada.');
  }
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Pagina principal' });
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

app.get('/editar/:id', (req, res) => {
  const noteId = req.params.id;
  res.render('editar', { noteId, title: 'Edit Note' });
});

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
  res.render('linkconfirm', { title: 'Link Confirm' });
});

app.get('/password', (req, res) => {
  res.render('password', { title: 'Reset Password' });
});

// =====================
// 🚀 Servidor
// =====================
app.listen(PORT, () => {
  const url =
    NODE_ENV === 'production'
      ? 'Producción'
      : `http://localhost:${PORT}`;

  console.log(`🚀 Servidor corriendo en ${url}`);
});