const merge = require('webpack-merge')
const common = require('./webpack.common')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: { compress: { drop_console: true } }
      })
    ],
    splitChunks: {
      name: 'main',
      chunks: 'all'
    }
  },
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
              importLoaders: 2 // postcss-loader, sass-loader
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('cssnano')({ preset: 'default' })
              ]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
})
