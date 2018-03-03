const config = require("./webpack.config.base");
const helpers = require("./helpers");
const path = require("path");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const webpack = require("webpack");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const merge = require("webpack-merge");
const OptimizeJsPlugin = require("optimize-js-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { defineEnv } = require("./webpack.common");

const ENV = "production";
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

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
        defineEnv(ENV),

        /**
         * Plugin: UglifyJsPlugin
         * Description: Minimize all JavaScript output of chunks.
         * Loaders are switched into minimizing mode.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
         */
        // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
        // Disable uglify unti it supports ES6 correctly
        // new UglifyJsPlugin({
        //     beautify: true, // debug
        //     mangle: false, //debug
        //     // compress: {
        //     //   screw_ie8: true,
        //     //   keep_fnames: true,
        //     //   drop_debugger: false,
        //     //   dead_code: false,
        //     //   unused: false
        //     // }, // debug
        //     // output: {
        //     //     comments: true
        //     // }, // Debug

        //     // beautify: false, //prod
        //     output: {
        //         comments: false
        //     }, //prod
        //     // mangle: {
        //     //     screw_ie8: true,
        //     //     keep_fnames: true,
        //     // }, //prod
        //     compress: {
        //         screw_ie8: true,
        //         warnings: false,
        //         conditionals: true,
        //         unused: true,
        //         comparisons: true,
        //         sequences: true,
        //         dead_code: true,
        //         evaluate: true,
        //         if_return: true,
        //         join_vars: true,
        //         negate_iife: false // we need this for lazy v8
        //     },
        // }),

        new LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            options: {

                /**
                 * Html loader advanced options
                 *
                 * See: https://github.com/webpack/html-loader#advanced-options
                 */
                // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
                htmlLoader: {
                    minimize: true,
                    removeAttributeQuotes: false,
                    caseSensitive: true,
                    customAttrSurround: [
                        [/#/, /(?:)/],
                        [/\*/, /(?:)/],
                        [/\[?\(?/, /(?:)/]
                    ],
                    customAttrAssign: [/\)?\]?=/]
                },

            }
        }),
    ],
});
