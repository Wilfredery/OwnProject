// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",

  entry: path.resolve(__dirname, "src/js/app.js"),

  output: {
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "public/build/js"),
    // ❌ NO clean aquí cuando usas Gulp
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
                  targets: "defaults"
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
