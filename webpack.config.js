const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  watch: true,
  entry: path.join(__dirname, 'src', 'index.ts'),
  output: {
    path: __dirname + '/dist/js/',
    filename: "index.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        /* use: [
          {loader: 'babel-loader', options: {presets: ['@babel/preset-env']}},
          {loader: 'ts-loader',  options: {transpileOnly: true}}
        ], */
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};