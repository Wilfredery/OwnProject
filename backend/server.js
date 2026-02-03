// backend/server.js
const express = require('express'); //Trae Express: el framework HTTP que maneja rutas, middlewares y respuestas.
const path = require('path');//Útil para construir rutas de archivos de forma segura entre sistemas (Windows/Linux)
const app = express();
// 🔐 Limita el parser de query (evita qs profundo)
app.set('query parser', 'simple');
const PORT = process.env.PORT || 3000;

// Configuración de vistas con EJS
//Le dices a Express que uses EJS y dónde están los archivos .ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Archivos estáticos (public/build)
app.use(express.static(path.join(__dirname, '../public')));

// Variables globales disponibles en todas las vistas
app.use((req, res, next) => {
  res.locals.title = 'Mi Proyecto'; // valor por defecto
  res.locals.year = new Date().getFullYear();
  next();
});

// Rutas
app.get('/auth/action', (req, res) => {
  const mode = req.query.mode;
  const oobCode = req.query.oobCode;

  if (!mode || !oobCode) {
    return res.status(400).send('Parámetros inválidos.');
  }

  // Decide qué vista renderizar según el mode
  switch (mode) {
    case 'verifyEmail':
      // Muestra la página de confirmación
      return res.render('linkconfirm', { title: 'Confirmar Email', oobCode });

    case 'resetPassword':
      // Muestra la página para restablecer contraseña
      return res.render('password', { title: 'Restablecer Contraseña', oobCode });

    default:
      return res.status(400).send('Acción no soportada.');
  }
});

app.get('/main', (req, res) => {
  res.render('index', { title: 'Pagina principal' });
});

app.get('/account-settings', (req, res) => {
  res.render('acc&sett', { title: 'Account & Settings' });
});

app.get('/search', (req, res) => {
  res.render('search', { title: 'Search Note'});
});

app.get('/crear', (req, res) => {
  res.render('crear', { title: 'Create Note'});
});

app.get("/editar/:id", (req, res) => {
    const noteId = req.params.id;
    res.render("editar", { noteId, title: "Edit Note" });
});

app.get('/', (req, res) => {
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

// Servidor
//Permite que el puerto sea configurable por variables de entorno (útil en hosting).
app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
