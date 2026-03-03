// webpack.config.cjs
const path = require("path");
const webpack = require("webpack");
require("dotenv").config();

module.exports = {
  mode: "development",

  // 🔴 IMPORTANTE: usa ruta relativa con "./"
  entry: "./src/js/app.js",

  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "public/build/js"),
    clean: true, // 🧼 limpia builds viejos
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
    // ✅ FORMA PROFESIONAL Y SEGURA
    new webpack.DefinePlugin({
      "process.env": JSON.stringify({
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID:
          process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      }),
    }),
  ],

  resolve: {
    extensions: [".js"],
  },
};