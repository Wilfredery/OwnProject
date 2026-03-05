/* ======================================================
   GULPFILE.CJS
   ======================================================
   This file sets up the development workflow using Gulp
   for a Node.js + EJS project with SCSS and JavaScript 
   bundling via Webpack.

   Features:
   - Compiles SCSS to CSS with minification and sourcemaps.
   - Bundles JavaScript using Webpack, including Babel 
     transpilation and environment variables via Dotenv.
   - Automatic browser reloading with BrowserSync.
   - Nodemon integration for automatic server restarts.
   - Watch tasks for SCSS, JS, and EJS changes.

   Notes:
   - Mobile-first and responsive styles are handled in SCSS.
   - Webpack outputs to public/build/js/bundle.min.js
   - SCSS outputs to public/build/css/app.css
====================================================== */

const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const nodemon = require("nodemon");

// --- Webpack ---
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const Dotenv = require("dotenv-webpack");

// --------------------
// PATHS
// --------------------
const paths = {
  scssEntry: "src/scss/app.scss", // SCSS entry point
  scss: "src/scss/**/*.scss",     // All SCSS files
  cssDest: "public/build/css",    // Compiled CSS output

  jsDest: "public/build/js",      // JS output

  ejs: "views/**/*.ejs",          // EJS templates
  server: "backend/server.js",    // Node.js server entry
};

// =====================
// SCSS TASK
// Compiles SCSS -> minified CSS + sourcemaps
// =====================
function styles() {
  return src(paths.scssEntry)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.cssDest))
    .pipe(browserSync.stream());
}

// =====================
// JS TASK (Webpack + Dotenv)
// Bundles JS, transpiles with Babel, injects environment variables
// =====================
function scripts() {
  return webpackStream(
    {
      mode: "development",
      entry: "./src/js/app.js",
      output: {
        filename: "bundle.min.js",
      },
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      targets: "defaults",
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
      plugins: [
        new Dotenv({
          path: "./backend/.env", // Environment variables file
          systemvars: true,       // Use system environment variables
        }),
      ],
    },
    webpack
  )
    .pipe(dest(paths.jsDest))
    .on("end", browserSync.reload);
}

// =====================
// BROWSER RELOAD
// Reloads the browser manually
// =====================
function reload(done) {
  browserSync.reload();
  done();
}

// =====================
// SERVER TASK
// Starts Nodemon and BrowserSync for live development
// =====================
function serve(done) {
  let started = false;

  nodemon({
    script: paths.server,
    watch: ["backend/**/*.js", "views/**/*.ejs"],
  }).on("start", () => {
    if (!started) {
      started = true;

      browserSync.init({
        proxy: "http://localhost:3000", // Proxy the Node server
        port: 3001,                     // BrowserSync port
        open: true,                      // Open browser automatically
        notify: false,                   // Disable notifications
      });

      done();
    } else {
      setTimeout(browserSync.reload, 500);
    }
  });

  // Watch SCSS, JS, and EJS changes
  watch(paths.scss, styles);
  watch("src/js/**/*.js", scripts);
  watch(paths.ejs, reload);
}

// =====================
// DEFAULT TASK
// Compiles SCSS & JS, then starts development server
// =====================
exports.default = series(parallel(styles, scripts), serve);