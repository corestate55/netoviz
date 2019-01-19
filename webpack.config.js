module.exports = (env, argv) => {
  const MODE = argv.mode || 'development'
  const DEBUG = MODE === 'development'
  // console.log(`MODE: ${MODE}`)
  const TerserPlugin = require('terser-webpack-plugin')
  const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

  return {
    entry: `./src/index.js`,
    mode: MODE,
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
    output: {
      path: `${__dirname}/dist`,
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js'
    },
    devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
    optimization: {
      minimizer: DEBUG ? [] : [
        new TerserPlugin({
          terserOptions: { compress: { drop_console: true } }
        })
      ],
      splitChunks: {
        name: 'main',
        chunks: 'all'
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader'
            },
            {
              loader: 'eslint-loader'
            }
          ]
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            MiniCSSExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: DEBUG,
                importLoaders: 2 // postcss-loader, sass-loader
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: DEBUG,
                plugins: [
                  require('cssnano')({ preset: 'default' })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: DEBUG
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCSSExtractPlugin({ filename: 'netoviz.css' })
    ]
  }
}
