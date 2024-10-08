const config = require("./webpack.config.base");
const helpers = require("./helpers");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { defineEnv } = require("./webpack.common");

const ENV = "production";

module.exports = merge(config, {
    devtool: "source-map",
    mode: "production",
    optimization: {
        minimize: false,
    },
    resolve: {
        mainFields: ["es2015", "browser", "module", "main"],
    },
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
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            /**
             * Extract and compile SCSS files from .node_modules and the assets directory to external CSS file
             */
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ]

    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name]-[hash].css", chunkFilename: "[name]-[chunkhash].css" }),
        defineEnv(ENV),
    ],
});
