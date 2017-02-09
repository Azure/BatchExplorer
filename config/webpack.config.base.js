const webpack = require("webpack");
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

const METADATA = {
    baseUrl: '/',
    isDevServer: helpers.isWebpackDevServer()
};

console.log("Is running dev server", helpers.isWebpackDevServer());

const baseConfig = {
    entry: {
        "polyfills": "./app/polyfills.browser",
        "app": "./app/app.ts",
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
        new CheckerPlugin(),
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
        new HtmlWebpackPlugin({
            template: 'app/index.html',
            chunksSortMode: 'dependency',
            inject: 'body',
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
