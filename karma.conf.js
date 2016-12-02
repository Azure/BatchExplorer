const webpackConfig = require("./config/webpack.config.test");

// Karma config for testing the code running the browser environemnt.
// For the client testing use the mocha command line.
module.exports = function (config) {
    config.set({
        basePath: ".",
        frameworks: ["jasmine"],
        files: [
            { pattern: "app/polyfills.browser.ts", watched: false },
            "test/app/spec-bundle.ts",
            { pattern: "./config/karma.shim.js", watched: false },
        ],

        // proxied base paths
        proxies: {
        },

        port: 9876,

        logLevel: config.LOG_INFO,

        colors: true,

        autoWatch: true,

        browsers: ["Electron"],

        // Karma plugins loaded
        plugins: [
            "karma-jasmine",
            // "karma-coverage",
            "karma-jasmine-html-reporter",
            "karma-sourcemap-loader",
            "karma-mocha-reporter",
            "karma-electron",
            "karma-electron-launcher",
            "karma-webpack"
        ],

        // Coverage reporter generates the coverage
        reporters: ["mocha", "kjhtml"],

        // Source files that you wanna generate coverage for.
        // Do not include tests or libraries (these files will be instrumented by Istanbul)
        preprocessors: {
            "config/karma.shim.js": ["webpack", "sourcemap", "electron"],
            "app/**/*.{ts,js}": ["webpack", "sourcemap", "electron"],
            "test/app/**/*.{ts,js}": ["webpack", "sourcemap", "electron"],
        },
        client: {
            useIframe: false
        },
        webpack: webpackConfig,

        singleRun: false
    })
};
