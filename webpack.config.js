module.exports = {
    entry: `./src2/index.js`,
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
    }
};
