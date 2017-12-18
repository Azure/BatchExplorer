const webpack = require("webpack");
const helpers = require("./helpers");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CheckerPlugin = require("awesome-typescript-loader").CheckerPlugin;
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ngcWebpack = require("ngc-webpack");
const {commonRules} = require("./webpack.common");

const isDevServer = helpers.isWebpackDevServer();
const METADATA = {
    baseUrl: "/",
    isDevServer: isDevServer,
};

// Set to false for now, as it doesn't seem to work correctly https://github.com/angular/angular-cli/issues/2799
const AOT = false;

const baseConfig = {
    entry: {
        "polyfills": "./app/polyfills.browser",
        "app": "./app/app.ts",
    },

    resolve: {
        extensions: [".ts", ".js", ".json", ".scss", ".css", ".html"],
        modules: [helpers.root(), helpers.root("src"), helpers.root("node_modules")],
    },

    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: [ "@ngtools/webpack" ],
                exclude: [/\.spec\.ts/, /src\/test\//]
            },
            ...commonRules,
        ],
    },
    plugins: [
        new CheckerPlugin(),
        new ngcWebpack.NgcWebpackPlugin({
            AOT,                            // alias for skipCodeGeneration: false
            tsConfigPath: "./tsconfig.json",
            mainPath: "./app/app.ts"              // will auto-detect the root NgModule.
        }),
        new CopyWebpackPlugin([
            { context: "src/client/splash-screen", from: "**/*", to: "client/splash-screen" },
            { context: "app/assets", from: "**/*", to: "assets" },
            { from: "node_modules/monaco-editor/min/vs", to: "vendor/vs",  },
        ]),
        new CommonsChunkPlugin({
            name: "polyfills",
            chunks: ["polyfills"],
        }),
        // This enables tree shaking of the vendor modules
        new CommonsChunkPlugin({
            name: "vendor",
            chunks: ["app"],
            minChunks: module => /node_modules/.test(module.resource),
        }),
        // Specify the correct order the scripts will be injected in
        new CommonsChunkPlugin({
            name: ["polyfills", "vendor"].reverse(),
        }),
        new HtmlWebpackPlugin({
            template: "app/index.html",
            chunksSortMode: "dependency",
            inject: "body",
            metadata: METADATA,
        }),
        // Workaround for WARNING Critical dependency: the request of a dependency is an expression
        new webpack.ContextReplacementPlugin(/ajv(\\|\/)lib/, __dirname),
        new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/, __dirname),
        new webpack.ContextReplacementPlugin(/encoding/, __dirname),
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
    ],
    target: "electron-renderer",
};

module.exports = baseConfig;
