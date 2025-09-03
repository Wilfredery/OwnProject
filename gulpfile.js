const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

// Rutas
const paths = {
  scss: 'Public/scss/**/*.scss',    // Todos los SCSS
  css: 'Public/css/',                // Carpeta donde se genera CSS
  html: 'Public/*.html',             // Todos los HTML
  js: 'Public/js/**/*.js'            // Todos los JS
};

// Compilar SASS y minificar CSS
function styles() {
  return src(paths.scss)
    .pipe(sass().on('error', sass.logError)) // Compila SCSS
    .pipe(cleanCSS())                        // Minifica CSS
    .pipe(dest(paths.css))                   // Guarda en carpeta CSS
    .pipe(browserSync.stream());             // Inyecta cambios sin recargar toda la página
}

// Recargar navegador para HTML y JS
function reload(done) {
  browserSync.reload();
  done();
}

// Servidor de desarrollo con live reload
function serve() {
  browserSync.init({
    server: {
      baseDir: 'Public'  // Carpeta base del servidor
    }
  });

  watch(paths.scss, styles);  // Observa cambios en SCSS
  watch(paths.html, reload);   // Observa cambios en HTML
  watch(paths.js, reload);     // Observa cambios en JS
}

// Tarea por defecto
exports.default = series(styles, serve);
