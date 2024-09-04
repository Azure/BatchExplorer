import * as helpers from "./helpers.js";
import * as path from "path";
// const { commonRules } = require("./webpack.common.js");
import { commonRules } from "./webpack.common.mjs";

export default {
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
                loader: '@ngtools/webpack',
                exclude: [/\.spec\.ts/, /src\/test\//]
            },
            ...commonRules,
        ],
    },
    stats: {
        errorDetails: true,
    },
};

