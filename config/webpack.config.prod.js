const config = require("./webpack.config.base");
const helpers = require("./helpers");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const OptimizeJsPlugin = require("optimize-js-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

module.exports = merge(config, {
    devtool: "source-map",
    output: {
        /**
         * The output directory as absolute path (required).
         *
         * @see http://webpack.github.io/docs/configuration.html#output-path
         */
        path: helpers.root("build"),

        /**
         * Specifies the name of each output file on disk.
         * IMPORTANT: You must not specify an absolute path here!
         *
         * @see http://webpack.github.io/docs/configuration.html#output-filename
         */
        filename: "[name].[chunkhash].bundle.js",

        /**
         * The filename of the SourceMaps for the JavaScript files.
         * They are inside the output.path directory.
         *
         * @see http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
         */
        sourceMapFilename: "[name].[chunkhash].bundle.map",

        /**
         * The filename of non-entry chunks as relative path
         * inside the output.path directory.
         *
         * @see http://webpack.github.io/docs/configuration.html#output-chunkfilename
         */
        chunkFilename: "[id].[chunkhash].chunk.js"

    },
    module: {
        rules: [
            /**
             * Extract CSS files from node_modules and the assets directory to external CSS file
             */
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
                include: [/node_modules/, helpers.root("app", "assets", "styles")]
            },
            /**
             * Extract and compile SCSS files from .node_modules and the assets directory to external CSS file
             */
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!sass-loader"
                }),
                include: [/node_modules/, helpers.root("app", "assets", "styles")]
            },

        ]

    },
    plugins: [
        /**
         * Webpack plugin to optimize a JavaScript file for faster initial load
         * by wrapping eagerly-invoked functions.
         *
         * @see https://github.com/vigneshshanmugam/optimize-js-plugin
         */
        new OptimizeJsPlugin({
            sourceMap: false
        }),
        /**
         * Plugin: ExtractTextPlugin
         * Description: Extracts imported CSS files into external stylesheet
         *
         * @see https://github.com/webpack/extract-text-webpack-plugin
         */
        new ExtractTextPlugin("[name].[contenthash].css"),
    ],
});
