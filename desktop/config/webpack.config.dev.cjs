const config = require("./webpack.config.base.cjs");
const path = require("path");
const merge = require("webpack-merge");
const { defineEnv } = require("./webpack.common.cjs");
const EvalSourceMapDevToolPlugin = require("webpack/lib/EvalSourceMapDevToolPlugin");

merge.strategy({ plugins: "replace" });

const ENV = "development";
const host = "localhost";
const port = process.env.PORT || 3178;

module.exports = merge(config, {

    entry: {
        "polyfills": "./src/app/polyfills.browser",
        "app": "./src/app/app.ts",
    },

    // devtool: "cheap-module-source-map",
    mode: "development",
    devServer: {
        host,
        port,
        // static: {
        //     directory: path.join(__dirname, 'app')
        // },
        client: {
            logging: "error"
        },
        devMiddleware: {
            writeToDisk: (filePath) => {
                return /vendor\/vs.*/.test(filePath);
            }
        },
    },
    output: {
        path: path.join(__dirname, "../build/"),
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
        chunkFilename: "[id].chunk.js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "singletonStyleTag",
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "singletonStyleTag",
                        },
                    },
                    "css-loader",
                ],
            }
        ],
    },
    plugins: [
        new EvalSourceMapDevToolPlugin({
            moduleFilenameTemplate: "[resource-path]",
            sourceRoot: "webpack:///"
        }),
        defineEnv(ENV)
    ],
});
