module.exports = {
  entry: `./src/index.js`,
  mode: "development",
  devServer: {
    contentBase: 'dist',
    open: true,
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 500, poll: 2000 },
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'eslint-loader'
          }
        ]
      }
    ]
  }
};
