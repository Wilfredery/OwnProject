// backend/server.js
const express = require('express'); //Trae Express: el framework HTTP que maneja rutas, middlewares y respuestas.
const path = require('path');//Útil para construir rutas de archivos de forma segura entre sistemas (Windows/Linux)
const app = express();
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
app.get('/', (req, res) => {
  res.render('index', { title: 'Pagina principal' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'Acerca de' });
});

// Servidor
//Permite que el puerto sea configurable por variables de entorno (útil en hosting).
app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
