const merge = require('webpack-merge')
const common = require('./webpack.common')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: 'dist',
    compress: true,
    open: true,
    historyApiFallback: true,
    host: '0.0.0.0',
    port: process.env.PORT || 8080,
    disableHostCheck: true,
    watchOptions: { aggregateTimeout: 500, poll: 2000 },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new MiniCSSExtractPlugin({ filename: 'netoviz.css' })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true,
              importLoaders: 2 // postcss-loader, sass-loader
            }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true }
          }
        ]
      }
    ]
  }
})
