const webpack = require("webpack");
const helpers = require("./helpers");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { AngularCompilerPlugin } = require("@ngtools/webpack");
const { commonRules } = require("./webpack.common");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const isDevServer = helpers.isWebpackDevServer();
const AOT = !isDevServer;
const METADATA = {
    baseUrl: "/",
    isDevServer: isDevServer,
    AOT,
};

const baseConfig = {
    entry: {
        "polyfills": "./src/app/polyfills.browser",
        "app": "./src/app/app.ts",
    },

    resolve: {
        extensions: [".ts", ".js", ".json", ".scss", ".css", ".html"],
        modules: [helpers.root(), helpers.root("src"), "node_modules"],
        alias: {
            // Prevent duplicate copies of react from being resolved
            // (See https://github.com/facebook/react/issues/13991)
            react: path.resolve("../node_modules/react"),
            "react-dom": path.resolve('../node_modules/react-dom'),
            // Since we are patching the core-util module' isNode variable,
            // we need to make sure that the patched version is used by all
            "@azure/core-util": path.resolve('./node_modules/@azure/core-util'),
        },
    },

    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                use: ["@ngtools/webpack"],
                exclude: [/\.spec\.ts/, /src\/test\//]
            },
            ...commonRules,
        ],
    },
    plugins: [
        new MonacoWebpackPlugin(),
        new AngularCompilerPlugin({
            skipCodeGeneration: !AOT,
            tsConfigPath: "./tsconfig.browser.json",
            mainPath: "./src/app/app.ts",              // will auto-detect the root NgModule.
            sourceMap: true,
            // forkTypeChecker: !AOT,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { context: "src/client/splash-screen", from: "**/*", to: "client/splash-screen" },
                { context: "src/client/proxy", from: "**/*", to: "client/proxy" },
                { context: "src/client/resources", from: "**/*", to: "client/resources" },
                { context: "src/app/assets", from: "**/*", to: "assets" },
            ]
        }),
        new HtmlWebpackPlugin({
            template: "src/app/index.html",
            chunksSortMode: (a, b) => {
                const entryPoints = ["app", "vendor", "styles", "sw-register", "polyfills", "inline"];
                return entryPoints.indexOf(b.names[0]) - entryPoints.indexOf(a.names[0]);
            },
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
