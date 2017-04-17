const config = require("./webpack.config.base");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const helpers = require("./helpers");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const DllBundlesPlugin = require("webpack-dll-bundles-plugin").DllBundlesPlugin;
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");

const webpackMergeDll = merge.strategy({ plugins: "replace" });
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

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
                loader: "style-loader!css-loader!sass-loader",
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader",
            }
        ],
    },
    plugins: [
        new DefinePlugin({
            "ENV": JSON.stringify(ENV),
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
