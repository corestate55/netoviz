module.exports = {
  entry: `${__dirname}/../src/index.js`,
  output: {
    path: `${__dirname}/../dist`,
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
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
      }
    ]
  }
}
