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
          'babel-loader',
          'eslint-loader'
        ]
      }
    ]
  }
}
