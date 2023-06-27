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
    _logger = require("./configuration").mainLogger;
}

export const log: Logger = _logger;
