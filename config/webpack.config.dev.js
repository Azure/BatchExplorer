const config = require("./webpack.config.base");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");

const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const host = "localhost";
const port = process.env.PORT || 3178;

module.exports = merge(config, {
    devtool: "cheap-module-source-map",
    // debug: true,
    devServer: { host, port },
    output: {
        path: path.join(__dirname, "../build/"),
        publicPath: `http://${host}:${port}/build/`,
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
        chunkFilename: "[id].chunk.js",
    },
    plugins: [
        new CommonsChunkPlugin({ name: "polyfills", filename: "polyfills.js", minChunk: Infinity }),
    ],
});
