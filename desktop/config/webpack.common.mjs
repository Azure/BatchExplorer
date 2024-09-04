import * as helpers from "./helpers.js";
import linkerPlugin from '@angular/compiler-cli/linker/babel';
import webpack from "webpack";

const rules = {
    html: {
        test: /(\.html$)|(\.template$)/,
        type: "asset/source",
        exclude: [/node_modules/, helpers.root("src/app/index.html")],
    },
    json: {
        test: /\.json$/,
        type: "asset/source",
        exclude: [/node_modules/],
    },
    file: {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: "asset/resource",
    },
    font: {
        test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset"
    },
    // Added to support partial compiled code, https://github.com/angular/angular/issues/44026
    // https://v13.angular.io/guide/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli
    mjs: {
        test: /\.m?js$/,
        exclude: /sloppy.js/,
        use: {
            loader: 'babel-loader',
            options: {
                plugins: [linkerPlugin],
                compact: false,
                cacheDirectory: true,
            }
        }
    }
};

export const commonRules = [
    rules.html, rules.json, rules.file, rules.font, rules.mjs
];

export const defineEnv = function(env) {
    return new webpack.DefinePlugin({
        "ENV": JSON.stringify(env),
        "process.env": {
            "ENV": JSON.stringify(env),
            "NODE_ENV": JSON.stringify(env),
            "RENDERER": JSON.stringify(true),
            "HOT": helpers.hasProcessFlag("hot"),
            "BE_ENABLE_A11Y_TESTING": process.env.BE_ENABLE_A11Y_TESTING,
        },
    });
};

// exports.rules = rules;
// exports.commonRules = commonRules;
