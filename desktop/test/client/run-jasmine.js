const path = require("path");
// Preserve any pre-existing NODE_PATH (e.g. the directory nyc/spawn-wrap adds so
// its bare `--require node-preload.js` resolves). Overwriting it would leave the
// ESM hook worker spawned by the shim below unable to resolve node-preload.js.
const srcPath = path.join(__dirname, "../../src");
process.env.NODE_PATH = process.env.NODE_PATH
    ? srcPath + path.delimiter + process.env.NODE_PATH
    : srcPath;
require("module").Module._initPaths();

// Register ts-node BEFORE the asset-extension stubs below. The stubs add require
// handlers for .html/.css/.svg/etc.; if they are registered before ts-node's .ts
// handler, an extensionless import such as "./manual-proxy-configuration-window"
// resolves to a same-named asset (e.g. manual-proxy-configuration-window.html)
// instead of the .ts source. Registering ts-node first keeps .ts ahead of the
// asset extensions in the resolution order.
require("./ts-node.helper");

// Set up rxjs ESM resolution + non-JS asset stubs so the Angular app source can
// be loaded in this plain Node (jasmine) process. Required directly (rather than
// via NODE_OPTIONS) so it does not clobber nyc's coverage instrumentation.
require("../../scripts/node-test-shims.cjs");

// Angular 22 ships partially-compiled (Ivy partial) declarations; loading them
// in a plain Node process falls back to the JIT compiler, so @angular/compiler
// must be loaded before any Angular declaration is evaluated.
require("@angular/compiler");

const Jasmine = require("jasmine");
const { SpecReporter } = require("jasmine-spec-reporter");

const jrunner = new Jasmine();
jrunner.env.clearReporters();                                       // jasmine >= 2.5.2, remove default reporter logs
jrunner.addReporter(new SpecReporter({
    spec: {
        displayStacktrace: true,
    }
}));                            // add jasmine-spec-reporter
jrunner.loadConfigFile(path.join(__dirname, "jasmine.json"));       // load jasmine.json configuration
jrunner.execute();
