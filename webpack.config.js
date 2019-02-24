const path = require('path');
const webpack = require('webpack');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: ['./src/index.js'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].js',
    publicPath: '/public/assets/',
  },
  /* watch: process.env.NODE_ENV !== 'production',
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  }, */
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          /* name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            console.log(packageName);
            return `npm.${packageName}`;
          }, */
        },
      },
    },
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
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader'], // , 'postcss-loader', 'sass-loader'
      },
    ],
  },
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
    /* new CopyWebpackPlugin([
      { from: './images', to: '../images' },
      // { from: './favicon.ico', to: '../favicon.ico' },
    ]), */
  ],
};
