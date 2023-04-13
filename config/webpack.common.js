const helpers = require("./helpers");
const { DefinePlugin } = require("webpack");

const rules = {
    html: {
        test: /\.html$/,
        loader: "raw-loader",
        exclude: [/node_modules/, helpers.root("src/app/index.html")],
    },
    json: {
        type: "javascript/auto",
        test: /\.json$/,
        loader: "raw-loader",
        exclude: [/node_modules/],
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

exports.defineEnv = function(env) {
    return new DefinePlugin({
        "ENV": JSON.stringify(env),
        "process.env": {
            "ENV": JSON.stringify(env),
            "NODE_ENV": JSON.stringify(env),
            "RENDERER": JSON.stringify(true),
            "HOT": helpers.hasProcessFlag("hot"),
        },
        // KLUDGE: This is a hack to make @azure/core-http thinks it's running in the browser,
        // which uses process.versions.node to determine the environment.
        // @azure/storage-blob uses isNode variable exported from @azure/core-http to determine
        // how it should process data. Since we are using this SDK in the renderer process, it
        // should get isNode = false.
        // github issue: https://msazure.visualstudio.com/AzureBatch/_workitems/edit/17956715
        "process.versions.node": "''",
    });
};

exports.rules = rules;
exports.commonRules = commonRules;
