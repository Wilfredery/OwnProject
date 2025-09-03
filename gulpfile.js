const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

// Rutas
const paths = {
  scss: 'Public/scss/**/*.scss',
  css: 'Public/css',
  html: 'Public/*.html',
  js: 'Public/js/**/*.js'
};

// Compilar SASS y minificar CSS
function styles() {
  return src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.css))
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
    server: {
      baseDir: 'Public'
    }
  });

  watch(paths.scss, styles);       // Observa cambios en SASS
  watch(paths.html, reload);        // Observa cambios en HTML
  watch(paths.js, reload);          // Observa cambios en JS
}

// Tarea por defecto
exports.default = series(styles, serve);