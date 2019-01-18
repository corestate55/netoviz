module.exports = (env, argv) => {
  const MODE = argv.mode || 'development'
  const DEBUG = MODE === 'development'
  // console.log(`MODE: ${MODE}`)
  const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

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
        new UglifyJSPlugin({
          uglifyOptions: { compress: { drop_console: true } }
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
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: DEBUG,
                importLoaders: 2 // postcss-loader, sass-loader
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
    }
  }
}
