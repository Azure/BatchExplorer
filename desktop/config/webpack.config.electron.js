/**
 * Webpack configuration for the Electron **main process** (and preload scripts).
 *
 * Why this exists: as of Angular 16+ the framework packages are ESM-only and, from
 * Angular 21+, expose their types exclusively through the package.json "exports" map.
 * The main process is CommonJS (run directly by Electron), and CommonJS cannot
 * `require()` an ESM-only package. Bundling the main process with webpack resolves
 * this: webpack reads the "exports" maps, bundles the ESM Angular code, and emits
 * CommonJS output that Electron can load.
 *
 * Design notes:
 *  - Output paths mirror the previous `tsc` layout (build/client/*.js) so that all the
 *    `__dirname`-relative path math in client-constants.ts and the package.json "main"
 *    field keep working unchanged.
 *  - Only `@angular/*` (ESM-only) is bundled. Every other node_modules package is left
 *    external and `require`d at runtime, matching the previous runtime behaviour and
 *    avoiding issues with native modules / dynamic requires.
 *  - process.env.* is intentionally NOT inlined (optimization.nodeEnv=false, no
 *    DefinePlugin) because the client reads NODE_ENV / HOT / DEV_TOOLS_MODE at runtime
 *    (e.g. main.prod.ts sets NODE_ENV="production" at runtime).
 */
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const helpers = require("./helpers");

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === "production" || NODE_ENV === "prod";

// First-party absolute-import roots. The base tsconfig maps "*" -> "src/*", so any
// top-level entry under src/ can be imported as a bare specifier (e.g. `common`,
// `client/menu`, `@batch-flask/core`). These must all be BUNDLED, not externalized —
// the previous tsc build emitted them under build/ and relied on a runtime NODE_PATH
// hack, which no longer applies once the main process is bundled.
const srcRoots = new Set(
    fs.readdirSync(helpers.root("src")).map((name) => name.replace(/\.(ts|js)$/, "")),
);

function firstSegment(request) {
    return request.split("/")[0];
}

module.exports = {
    target: "electron-main",
    mode: isProd ? "production" : "development",
    devtool: "source-map",
    entry: {
        "client/main": "./src/client/main.ts",
        "client/main.prod": "./src/client/main.prod.ts",
        "client/preload-insecure-test": "./src/client/preload-insecure-test.ts",
    },
    output: {
        path: helpers.root("build"),
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
    },
    resolve: {
        extensions: [".ts", ".mjs", ".js", ".json"],
        // Mirror the renderer config so absolute imports (client/..., common/...,
        // @batch-flask/...) resolve without the runtime NODE_PATH hack.
        modules: [helpers.root(), helpers.root("src"), "node_modules"],
        alias: {
            // Ensure the patched copy of @azure/core-util is used (see patches/).
            "@azure/core-util": path.resolve("./node_modules/@azure/core-util"),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: {
                    configFile: helpers.root("tsconfig.electron.json"),
                },
                exclude: [/\.spec\.ts$/, /[\\/]src[\\/]test[\\/]/, /[\\/]testing[\\/]/],
            },
            {
                // Angular ships fesm ESM (.mjs) with extensionless internal imports.
                test: /\.m?js$/,
                resolve: { fullySpecified: false },
            },
        ],
    },
    // Keep the real Node __dirname/__filename so client-constants.ts path math works.
    node: {
        __dirname: false,
        __filename: false,
    },
    optimization: {
        // Keep readable stack traces in the packaged app.
        minimize: false,
        // Do NOT inject process.env.NODE_ENV; the client reads it at runtime.
        nodeEnv: false,
        // Each entry (main, main.prod, preload) must be fully self-contained since
        // they are loaded independently by Electron. Prevent webpack from hoisting
        // shared modules into a separate chunk (which would leave main.prod empty).
        splitChunks: false,
        runtimeChunk: false,
    },
    externals: [
        ({ request }, callback) => {
            // Bundle Angular (ESM-only) so it is converted to CommonJS.
            if (/^@angular[\\/]/.test(request)) {
                return callback();
            }
            // Bundle first-party source: relative imports, absolute paths, and any
            // bare specifier whose first segment is a top-level src/ root
            // (e.g. `common`, `client/...`, `@batch-flask/core`).
            if (
                request.startsWith(".") ||
                path.isAbsolute(request) ||
                srcRoots.has(firstSegment(request))
            ) {
                return callback();
            }
            // Everything else (node builtins, electron, other node_modules) stays
            // external and is required at runtime from node_modules.
            return callback(null, "commonjs " + request);
        },
    ],
    plugins: [
        // Silence the "Critical dependency" warning from Angular's runtime linker.
        new webpack.ContextReplacementPlugin(
            /@angular(\\|\/)core(\\|\/)/,
            helpers.root("src"),
        ),
    ],
    stats: {
        errorDetails: true,
    },
    // The main process intentionally uses runtime `require` indirection
    // (ElectronApp.require, preload's `window.require = require`) to keep certain
    // modules external. Webpack can't statically analyse these; the warning is expected.
    ignoreWarnings: [
        { message: /Critical dependency: require function is used in a way/ },
    ],
};
