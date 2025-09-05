const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const fs = require('fs');

// Rutas
const paths = {
  scssEntry: 'src/scss/app.scss',
  scss: 'src/scss/**/*.scss',
  cssDest: 'public/build/css',
  img: 'src/img/**/*',
  imgDest: 'public/build/img',
  ejs: 'views/**/*.ejs'
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

// Servidor de desarrollo con live reload
function serve() {
  browserSync.init({
    proxy: 'http://localhost:3000', // Express
    port: 3001,
    open: true,
    notify: false
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
