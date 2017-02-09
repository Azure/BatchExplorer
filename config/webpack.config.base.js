const webpack = require("webpack");
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const METADATA = {
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer()
};

const baseConfig = {
    entry: {
        "polyfills": "./app/polyfills.browser",
        "app": "./app/app",
    },

    resolve: {
        extensions: [".ts", ".js", ".json", ".scss", ".css", ".html"],
        modules: [".", "node_modules"],
    },

    module: {
        rules: [{
            test: /\.ts$/,
            loaders: ["awesome-typescript-loader", "angular2-template-loader"],
            exclude: [/node_modules/],
        },
        {
            test: /\.scss$/,
            loader: "style-loader!css-loader!sass-loader",
            exclude: [/node_modules/],
        },
        {
            test: /\.html$/,
            loader: "raw-loader",
            exclude: [/node_modules/, helpers.root('app/index.html')],
        },
        {
            test: /\.json$/,
            loader: "raw-loader",
            exclude: [],
        },
        {
            test: /node_modules.*\.css$/,
            loader: "raw-loader",
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'app/index.html',
            chunksSortMode: 'dependency',
            inject: 'head',
            metadata: METADATA,
        }),
        // Workaround for WARNING Critical dependency: the request of a dependency is an expression
        new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/, __dirname),
        new webpack.LoaderOptionsPlugin({
            debug: true
        })
    ],
    target: "electron-renderer",
};

module.exports = baseConfig;
