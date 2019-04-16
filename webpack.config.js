const path = require('path');
const webpack = require('webpack');

let config = {
  mode: 'development',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
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

let config_RFA = Object.assign({}, config, {
  entry: path.join(__dirname, 'src', 'index_RFA.ts'),
  output: {
    path: __dirname + '/dist/js/',
    filename: "index_RFA.bundle.js",
  }
});

let config_unknow = Object.assign({}, config, {
  entry: path.join(__dirname, 'src', 'index_unknow.ts'),
  output: {
    path: __dirname + '/dist/js/',
    filename: "index_unknow.bundle.js",
  }
});

module.exports = [config_RFA, config_unknow];

// module.exports = {
//   mode: 'development',
//   watch: true,
//   entry: path.join(__dirname, 'src', 'index_RFA.ts'),
//   output: {
//     path: __dirname + '/dist/js/',
//     filename: "index_RFA.bundle.js",
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js']
//   },
//   plugins: [
//     new webpack.ProvidePlugin({
//       $: "jquery",
//       jQuery: "jquery"
//     })
//   ]
// };