// webpack.config.cjs
const path = require("path");
const webpack = require("webpack");
require("dotenv").config(); // Load environment variables from .env

module.exports = {
  mode: "production", // Set Webpack mode to production

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
      "process.env.FIREBASE_API_KEY": JSON.stringify(process.env.FIREBASE_API_KEY),
      "process.env.FIREBASE_AUTH_DOMAIN": JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      "process.env.FIREBASE_PROJECT_ID": JSON.stringify(process.env.FIREBASE_PROJECT_ID),
      "process.env.FIREBASE_STORAGE_BUCKET": JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
      "process.env.FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
      "process.env.FIREBASE_APP_ID": JSON.stringify(process.env.FIREBASE_APP_ID),
    }),
  ],

  resolve: {
    extensions: [".js"], // Automatically resolve .js extensions
  },
};