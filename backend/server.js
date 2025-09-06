// backend/server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de vistas con EJS
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
app.get('/', (req, res) => {
  res.render('index', { title: 'Pagina principal1' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'Acerca de' });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
