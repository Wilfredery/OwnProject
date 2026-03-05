// webpack.config.cjs
const path = require("path");
const webpack = require("webpack");
require("dotenv").config(); // Load environment variables from .env

module.exports = {
  mode: "development", // Set Webpack mode to development

  // 🔴 IMPORTANT: Use relative path for entry
  entry: "./src/js/app.js", // Entry point for JS bundling

  output: {
    filename: "bundle.min.js", // Output filename
    path: path.resolve(__dirname, "public/build/js"), // Output directory
    clean: true, // 🧼 Clean old builds before generating new ones
  },

  devtool: "source-map", // Generate source maps for easier debugging

  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: "babel-loader", // Use Babel to transpile JS
          options: {
            presets: [
              [
                "@babel/preset-env", // Target modern browsers
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
    // ✅ PROFESSIONAL AND SECURE WAY TO PASS ENV VARIABLES
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
    extensions: [".js"], // Automatically resolve .js extensions
  },
};