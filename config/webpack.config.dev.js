const config = require("./webpack.config.base");
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const helpers = require('./helpers');

const webpackMergeDll = merge.strategy({ plugins: 'replace' });
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

const host = "localhost";
const port = process.env.PORT || 3178;

module.exports = merge(config, {
    devtool: "cheap-module-source-map",
    // debug: true,
    devServer: {
        host, port,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },
    output: {
        path: path.join(__dirname, "../build/"),
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
        chunkFilename: "[id].chunk.js",
        // library: 'ac_[name]',
        // libraryTarget: 'var',
    },
    plugins: [
        // new CommonsChunkPlugin({ name: "polyfills", filename: "polyfills.js", minChunk: Infinity }),
        new DllBundlesPlugin({
            bundles: {
                polyfills: [
                    'core-js',
                    'zone.js',
                ],
                vendor: [
                    '@angular/platform-browser',
                    '@angular/platform-browser-dynamic',
                    '@angular/core',
                    '@angular/common',
                    '@angular/forms',
                    '@angular/http',
                    '@angular/router',
                    'rxjs',
                    "immutable",
                    "moment",
                    "inflection",
                    "d3",
                ]
            },
            dllDir: helpers.root('dll'),
            webpackConfig: webpackMergeDll(config, {
                devtool: 'cheap-module-source-map',
                plugins: []
            })
        }),
        new AddAssetHtmlPlugin([
            { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`) },
            { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`) }
        ]),
    ],
});
