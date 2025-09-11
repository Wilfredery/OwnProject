const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const nodemon = require('nodemon');

// Rutas
const paths = {
  scssEntry: 'src/scss/app.scss',
  scss: 'src/scss/**/*.scss',
  cssDest: 'public/build/css',
  img: 'src/img/**/*',
  imgDest: 'public/build/img',
  ejs: 'views/**/*.ejs',
  server: 'backend/server.js'
};

// Compilar SCSS
function styles() {
  return src(paths.scssEntry)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.cssDest))
    .pipe(browserSync.stream());
}

// Copiar imágenes
function images(done) {
  if (!fs.existsSync('src/img')) fs.mkdirSync('src/img', { recursive: true });
  return src(paths.img)
    .pipe(dest(paths.imgDest))
    .pipe(browserSync.stream());
}

// Recargar navegador
function reload(done) {
  browserSync.reload();
  done();
}

// Levantar servidor con nodemon y sincronizar con Browsersync
function serve(done) {
  let started = false;

  nodemon({
  script: paths.server,
  watch: ['backend/**/*.js', 'views/**/*.ejs'] // Mira todo el backend y vistas
  }).on('start', () => {
    if (!started) {
      started = true;
      browserSync.init({
        proxy: 'http://localhost:3000', // Express
        port: 3001,
        open: true,
        notify: false
      });
      done();
    } else {
      setTimeout(() => {
        browserSync.reload(); // recarga navegador al reiniciar nodemon
      }, 500);
    }
  });

  watch(paths.scss, styles);
  watch(paths.img, images);
  watch(paths.ejs, reload);
}

// Tarea por defecto
exports.default = series(
  parallel(styles, images),
  serve
);
