// const config = require("./webpack.config.base.mjs");
import config from "./webpack.config.base.mjs";
// const helpers = require("./helpers.js");
import * as helpers from "./helpers.js";
// const { merge } = require("webpack-merge");
import { merge } from "webpack-merge";
// const { AngularWebpackPlugin } = require("@ngtools/webpack");
import { AngularWebpackPlugin } from "@ngtools/webpack";

export default merge(config, {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    target: "electron-main",
    node: {
        __dirname: false,
    },
    entry: {
        main: "./src/client/main.ts",
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: "node-loader",
            },
        ],
    },
    plugins:[
        new AngularWebpackPlugin({
            tsconfig: "./tsconfig.node.json",
            compilerOptions:{
                sourceMap: true,
            }
        }),
    ],
    output: {
        path: helpers.root("build/client"),
    },
});
