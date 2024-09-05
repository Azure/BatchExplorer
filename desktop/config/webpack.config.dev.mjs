import config from "./webpack.config.app-base.mjs";
import { merge } from "webpack-merge";
import { defineEnv } from "./webpack.common.mjs";
import EvalSourceMapDevToolPlugin from "webpack/lib/EvalSourceMapDevToolPlugin.js";
import * as helpers from "./helpers.js";

const ENV = "development";
const host = "localhost";
const port = process.env.PORT || 3178;
console.log('dirname', helpers.root());
export default merge(config, {

    mode: "development",
    devtool: "eval-source-map",
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
        path: helpers.root("build"),
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
