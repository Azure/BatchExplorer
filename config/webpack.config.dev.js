const config = require("./webpack.config.base");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const helpers = require("./helpers");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const DllBundlesPlugin = require("webpack-dll-bundles-plugin").DllBundlesPlugin;
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const { defineEnv } = require("./webpack.common");

const webpackMergeDll = merge.strategy({ plugins: "replace" });

const ENV = "development";
const host = "localhost";
const port = process.env.PORT || 3178;

module.exports = merge(config, {
    devtool: "cheap-module-source-map",
    // debug: true,
    devServer: {
        host,
        port,
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
                loader: [
                    {
                        loader: "style-loader",
                        options: {
                            singleton: true,
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/,
                loader: [
                    {
                        loader: "style-loader",
                        options: {
                            singleton: true,
                        },
                    },
                    "css-loader",
                ],
            }
        ],
    },
    plugins: [
        defineEnv(ENV),
        new WriteFilePlugin({
            test: /vendor\/vs.*/
        }),
        new DllBundlesPlugin({
            bundles: {
                polyfills: [
                    "reflect-metadata",
                    "core-js",
                    "zone.js",
                ],
                vendor: [
                    "@angular/platform-browser",
                    "@angular/platform-browser-dynamic",
                    "@angular/core",
                    "@angular/common",
                    "@angular/forms",
                    "@angular/http",
                    "@angular/router",
                    "rxjs",
                    "immutable",
                    "moment",
                    "inflection",
                    "d3",
                    "chart.js",
                ],
            },
            dllDir: helpers.root("dll"),
            webpackConfig: webpackMergeDll(config, {
                devtool: "cheap-module-source-map",
                plugins: [],
            }),
        }),
        new AddAssetHtmlPlugin([
            { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile("polyfills")}`) },
            { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile("vendor")}`) },
        ]),
    ],
});
