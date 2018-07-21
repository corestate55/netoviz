module.exports = {
  entry: `./src/index.js`,
  mode: "development",
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
