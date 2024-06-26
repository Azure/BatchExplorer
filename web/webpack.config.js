/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const TSConfigPathsWebpackPlugin = require("tsconfig-paths-webpack-plugin");
const BundleAnalyzerWebpackPlugin =
    require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const webpack = require("webpack");
const { EsbuildPlugin } = require("esbuild-loader");

const MODE_DEV = "development";
const MODE_PROD = "production";

/**
 * Build a bundle which can be imported into a regular web page and used without
 * any external dependencies.
 */
module.exports = (env) => {
    if (!env) {
        env = {};
    }

    // Contain all options for the build
    const OPTS = {
        TEST_MODE: env.test === true,
        DEV_MODE: env.dev === true,
        ANALYZE_MODE: env.analyze === true,
        WATCH_MODE: env.watch === true,
        LAUNCH_BROWSER: env.launch === true,
    };

    console.log("Webpack Configuration Options: ", OPTS);

    const webpackPlugins = [];

    webpackPlugins.push(
        new HtmlWebpackPlugin({
            template: "dev-server/index.html",
            inject: "head",
            scriptLoading: "module",
        })
    );

    webpackPlugins.push(
        new webpack.DefinePlugin({
            ENV: JSON.stringify({
                MODE: OPTS.DEV_MODE ? "dev" : "prod",
            }),
        })
    );

    webpackPlugins.push(
        new MonacoWebpackPlugin({
            languages: ["json"],
            filename: "[name].monaco-worker.js",
        })
    );

    if (OPTS.ANALYZE_MODE === true) {
        // Get stats on the final webpack bundle
        webpackPlugins.push(new BundleAnalyzerWebpackPlugin());
    }

    return {
        mode: OPTS.DEV_MODE ? MODE_DEV : MODE_PROD,
        target: "web",
        devtool: OPTS.DEV_MODE ? "inline-source-map" : undefined,
        watch: OPTS.WATCH_MODE ? true : undefined,

        output: {
            path: path.join(__dirname, "lib-umd"),
            filename: "batchexplorer.js",
            library: "batchexplorer",
            libraryTarget: "umd",
        },

        devServer: {
            open: OPTS.LAUNCH_BROWSER ? true : false,
            host: "127.0.0.1",
            hot: true,
            static: [
                {
                    directory: "dev-server",
                },
                {
                    directory: "resources",
                    publicPath: "/resources",
                },
            ],
            historyApiFallback: true,
            port: 9000,
            compress: true,
            headers: {
                Connection: "keep-alive",
            },
        },

        entry: "./src/index.tsx",

        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            plugins: [
                new TSConfigPathsWebpackPlugin({
                    extensions: [".ts", ".js"],
                    logLevel: "info",
                    logInfoToStdOut: true,
                    configFile: path.join(
                        __dirname,
                        "config",
                        "tsconfig.build.json"
                    ),
                }),
            ],
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "esbuild-loader",
                    include: [path.resolve(__dirname, "src")],
                    options: {
                        loader: "tsx",
                        target: "es2020",
                    },
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.ttf$/,
                    use: ["file-loader"],
                },
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, "../packages"),
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
            ],
        },

        plugins: webpackPlugins,

        resolveLoader: {
            modules: ["node_modules"],
        },

        optimization: {
            minimizer: OPTS.DEV_MODE
                ? []
                : [
                      new EsbuildPlugin({
                          target: "es2020",
                      }),
                  ],
        },
        watchOptions: {
            ignored: ["**/packages/**/src", "**/node_modules"],
        },
    };
};
