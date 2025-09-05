const path = require('path');

module.exports = {
  mode: 'development', // Cambia a 'production' cuando vayas a producción
  entry: './src/js/app.js',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'public/build/js'),
    clean: true
  },
  devtool: 'source-map', // Genera bundle.min.js.map
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  }
};
