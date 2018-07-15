module.exports = {
    entry: `./src/index.js`,
    mode: "development",
    devServer: {
        contentBase: 'dist',
        open: true,
        historyApiFallback: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 },
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    },
    output: {
        path: `${__dirname}/dist`,
        filename: 'main.js'
    }
};
