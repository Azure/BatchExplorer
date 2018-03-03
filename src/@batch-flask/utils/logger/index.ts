import { Logger } from "./base-logger";

// tslint:disable:no-var-requires
let _logger: any;
if (process.env.RENDERER) {
    const { RendererLogger } = require("./renderer-logger");
    _logger = new RendererLogger();
} else {
    const { NodeLogger } = require("./node-logger");
    _logger = NodeLogger.mainLogger;
}

export const log: Logger = _logger;
