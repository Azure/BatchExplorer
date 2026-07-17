const path = require("path");

require("ts-node").register({
    project: path.join(__dirname, "../../tsconfig.node.test.json"),
    files: true,
    // Transpile only: full type-checking here would fail on Angular 22's
    // exports-mapped subpaths (e.g. @angular/cdk/keycodes) under moduleResolution
    // "node", and on latent type errors the webpack build (also transpile-only)
    // tolerates. Node resolves those subpaths at runtime.
    transpileOnly: true,
});
