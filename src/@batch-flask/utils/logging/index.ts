import { Logger } from "./base-logger";

// tslint:disable:no-var-requires
let _logger: any;

if (process.env.NODE_ENV === "test") {
    const { TestLogger } = require("./test-logger");
    _logger = new TestLogger();
} else if (process.env.RENDERER) {
    const { RendererLogger } = require("./renderer-logger");
    _logger = new RendererLogger();
} else {
    const { NodeLogger } = require("./node-logger");
    _logger = NodeLogger.mainLogger;
}

export const log: Logger = _logger;
