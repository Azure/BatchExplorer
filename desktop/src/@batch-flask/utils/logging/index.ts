import { Logger } from "./base-logger";
import { NodeLogger } from "./node-logger";

/* eslint-disable @typescript-eslint/no-var-requires */
let _logger: any;

if (process.env.NODE_ENV === "test") {
    if (process.env.TEST_LOGGING) {
        _logger = new NodeLogger({ name: "batch-explorer" });
    } else {
        const { TestLogger } = require("./test-logger");
        _logger = new TestLogger();
    }
} else if (process.env.RENDERER) {
    const { RendererLogger } = require("./renderer");
    _logger = new RendererLogger(require("electron").ipcRenderer);
} else {
    // Main process: `mainLogger` is assigned lazily by configureLogging() (via
    // initLogger()), which can run AFTER this module is evaluated once the main
    // process is bundled (webpack hoists imports, so this module loads before
    // main.ts's initLogger() statement executes). Resolve `mainLogger` on each
    // access via a Proxy instead of snapshotting `undefined` at load time.
    const configuration = require("./configuration");
    _logger = new Proxy({} as Logger, {
        get(_target, prop) {
            // Fall back to the console until the real logger is configured, so a
            // logging call can never crash the process with "reading 'x' of undefined".
            const target = configuration.mainLogger || console;
            const value = target[prop];
            return typeof value === "function" ? value.bind(target) : value;
        },
    });
}

export const log: Logger = _logger;
