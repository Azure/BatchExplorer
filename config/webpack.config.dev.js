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
    devServer: { host, port },
    output: {
        path: path.join(__dirname, "../build/"),
        // publicPath: `http://${host}:${port}/build/`,
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
        chunkFilename: "[id].chunk.js",
        library: 'ac_[name]',
        libraryTarget: 'var',
    },
    plugins: [
        // new CommonsChunkPlugin({ name: "polyfills", filename: "polyfills.js", minChunk: Infinity }),
        new CommonsChunkPlugin({
            name: 'polyfills',
            chunks: ['polyfills']
        }),
        // This enables tree shaking of the vendor modules
        new CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['app'],
            minChunks: module => /node_modules/.test(module.resource)
        }),
        // Specify the correct order the scripts will be injected in
        new CommonsChunkPlugin({
            name: ['polyfills', 'vendor'].reverse()
        }),
        new DllBundlesPlugin({
            bundles: {
                polyfills: [
                    'core-js',
                    {
                        name: 'zone.js',
                        path: 'zone.js/dist/zone.js'
                    },
                    {
                        name: 'zone.js',
                        path: 'zone.js/dist/long-stack-trace-zone.js'
                    },
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
