const path = require("path");

require("ts-node").register({
    project: path.join(__dirname, "../../tsconfig.node.test.json"),
    files: true,
});
