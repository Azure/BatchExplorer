
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { AngularWebpackPlugin } from "@ngtools/webpack";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import { merge } from "webpack-merge";
import config from "./webpack.config.base.mjs";
import * as helpers from "./helpers.js";
import path from "path";

const isDevServer = helpers.isWebpackDevServer();
const AOT = !isDevServer;
const METADATA = {
    baseUrl: "/",
    isDevServer: isDevServer,
    AOT,
};

const appBaseConfig = merge(config, {
    entry: {
        "polyfills": "./src/app/polyfills.browser",
        "app": "./src/app/app.ts",
    },

    plugins: [
        new MonacoWebpackPlugin(),
        new AngularWebpackPlugin({
            // skipCodeGeneration: !AOT,
            tsconfig: "./tsconfig.browser.json",
            // mainPath: "./src/app/app.ts",              // will auto-detect the root NgModule.
            compilerOptions:{
                sourceMap: true,
            }
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
                return entryPoints.indexOf(b) - entryPoints.indexOf(a);
            },
            inject: "body",
            metadata: METADATA,
        }),
        // Workaround for WARNING Critical dependency: the request of a dependency is an expression
        new webpack.ContextReplacementPlugin(/ajv(\\|\/)lib/, helpers.root("config")),
        new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/, helpers.root("config")),
        new webpack.ContextReplacementPlugin(/encoding/, helpers.root("config")),
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
    ],
    target: "electron-renderer",
});
export default appBaseConfig;
