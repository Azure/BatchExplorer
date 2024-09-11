const config = require("./webpack.config.base");
const path = require("path");
const merge = require("webpack-merge");
const { defineEnv } = require("./webpack.common");
const EvalSourceMapDevToolPlugin = require("webpack/lib/EvalSourceMapDevToolPlugin");

merge.strategy({ plugins: "replace" });

const ENV = "development";
const host = "localhost";
const port = process.env.PORT || 3178;

module.exports = merge(config, {
    // devtool: "cheap-module-source-map",
    mode: "development",
    devServer: {
        host,
        port,
        client: {
            logging: "error",
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
            },
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
