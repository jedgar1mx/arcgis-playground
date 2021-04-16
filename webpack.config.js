const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ArcGISPlugin = require('@arcgis/webpack-plugin');

module.exports = {
  entry: {
    index: ['./src/index.js']
  },
  node: false,
  output: {
    path: path.join(__dirname, 'build'),
    chunkFilename: 'chunks/[id].js',
    publicPath: ''
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3001,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ContextReplacementPlugin(
      /\/@arcgis\/core\//,
      (data) => {
        delete data.dependencies[0].critical;
        return data;
      },
    ),    
    new ArcGISPlugin({ locales: ['en'] }),
    new HtmlWebPackPlugin({
      title: 'ArcGIS API  for JavaScript',
      template: './src/index.html',
      filename: './index.html',
      chunksSortMode: 'none',
      inlineSource: '.(css)$'
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css",
      chunkFilename: "[id].css"
    })
  ]
};