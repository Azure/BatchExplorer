// CommonJS preload (loaded via NODE_OPTIONS="--require ...") that sets up the
// Node environment for scripts which load the Angular app's source in a plain
// Node process (e.g. `npm run test-models`, which introspects model decorator
// metadata). It has NO effect on the webpack builds or the packaged app.
//
// It installs two shims:
//
// 1. rxjs directory-subpath ESM resolution.
//    rxjs 6 ships no package.json "exports" map, so Node's native ESM resolver
//    rejects bare directory subpath imports such as `rxjs/operators` with
//    ERR_UNSUPPORTED_DIR_IMPORT. Angular 22's fesm2022 output emits exactly such
//    imports. Angular 22 officially supports rxjs "^6.5.3 || ^7.4.0", so rather
//    than force an rxjs 7 upgrade or patch rxjs's package.json (which would also
//    change how webpack resolves rxjs), we register an ESM resolve hook that maps
//    rxjs's directory subpaths to their concrete `index.js`.
//
//    We use a CommonJS preload calling register() (rather than an ESM `--import`
//    with registerHooks): a synchronous/ESM hook makes Node's native .ts
//    type-stripper take over the entry from ts-node, which breaks on TypeScript
//    parameter properties. A CJS `--require` preload keeps ts-node's CommonJS
//    `.ts` transpilation in control while the resolve hook still intercepts
//    Angular's rxjs imports.
//
// 2. Non-JS asset imports.
//    Angular components import their styles/templates for the webpack build
//    (e.g. `import "./x.scss"`). Node cannot require those, so we register
//    require.extensions stubs that resolve them to an empty module. Component
//    classes only need to be imported (not instantiated) to read their metadata,
//    and Ivy defers template compilation until first use, so stubbing the assets
//    is sufficient.
const { register } = require("node:module");
const { pathToFileURL } = require("node:url");

const hooks = `
const RXJS_DIR_SUBPATHS = new Set([
    "rxjs/operators",
    "rxjs/testing",
    "rxjs/ajax",
    "rxjs/webSocket",
    "rxjs/fetch",
]);
export async function resolve(specifier, context, nextResolve) {
    if (RXJS_DIR_SUBPATHS.has(specifier)) {
        return nextResolve(specifier + "/index.js", context);
    }
    return nextResolve(specifier, context);
}
`;

register("data:text/javascript," + encodeURIComponent(hooks), pathToFileURL(__filename));

const ASSET_EXTENSIONS = [
    ".scss", ".sass", ".css", ".less",
    ".html",
    ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico",
    ".woff", ".woff2", ".ttf", ".eot",
];
for (const ext of ASSET_EXTENSIONS) {
    require.extensions[ext] = (module) => {
        module.exports = {};
    };
}
