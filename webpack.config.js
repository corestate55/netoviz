let MODE = 'production'
if (process.argv.includes('--debug')
  || process.argv.includes('--mode=development')) {
  MODE = 'development'
}
console.log('MODE: ', MODE)
const DEBUG = MODE === 'development'

module.exports = {
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
              minimize: true,
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
