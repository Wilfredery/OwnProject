const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const nodemon = require('nodemon');

// --- Webpack ---
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

// Rutas
const paths = {
  scssEntry: 'src/scss/app.scss',
  scss: 'src/scss/**/*.scss',
  cssDest: 'public/build/css',

  jsEntry: 'src/js/app.js',
  js: 'src/js/**/*.js',
  jsDest: 'public/build/js',

  ejs: 'views/**/*.ejs',
  server: 'backend/server.js'
};

/* ===================== SCSS ===================== */
function styles() {
  return src(paths.scssEntry)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.cssDest))
    .pipe(browserSync.stream());
}

/* ===================== JS ===================== */
function scripts() {
  return src(paths.jsEntry)
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(dest(paths.jsDest))
    .on('end', browserSync.reload);
}

/* ===================== RELOAD ===================== */
function reload(done) {
  browserSync.reload();
  done();
}

/* ===================== SERVER ===================== */
function serve(done) {
  let started = false;

  nodemon({
    script: paths.server,
    watch: ['backend/**/*.js', 'views/**/*.ejs']
  }).on('start', () => {
    if (!started) {
      started = true;

      browserSync.init({
        proxy: 'http://localhost:3000',
        port: 3001,
        open: true,
        notify: false
      });

      done();
    } else {
      setTimeout(browserSync.reload, 500);
    }
  });

  watch(paths.scss, styles);
  watch(paths.js, scripts);
  watch(paths.ejs, reload);
}

/* ===================== DEFAULT ===================== */
exports.default = series(
  parallel(styles, scripts),
  serve
);
