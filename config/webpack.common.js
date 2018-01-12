const helpers = require("./helpers");

const rules = {
    html: {
        test: /\.html$/,
        loader: "raw-loader",
        exclude: [/node_modules/, helpers.root("app/index.html")],
    },
    json: {
        test: /\.json$/,
        loader: "raw-loader",
        exclude: [],
    },
    file: {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
    },
    font: {
        test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff",
    },
};

const commonRules = [
    rules.html, rules.json, rules.file, rules.font,
];

exports.rules = rules;
exports.commonRules = commonRules;
