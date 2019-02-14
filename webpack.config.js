const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: ['./src/index.js'],
    vendor: ['jquery', 'jquery-ujs', 'popper.js', 'bootstrap'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].js',
    publicPath: '/public/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader'], // , 'sass-loader'
      },
    ],
  },
  /* optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        default: {
          enforce: true,
          priority: 1,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 2,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
        }
      }
    }
  }, */
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
  ],
};
