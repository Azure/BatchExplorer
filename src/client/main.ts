import * as path from "path";
process.env.NODE_PATH = path.join(__dirname, "..");
// tslint:disable-next-line:no-var-requires
require("module").Module._initPaths();
// IMPORTANT this needs to be before the first import of the logger
import { app } from "electron";
app.setPath("userData", path.join(app.getPath("appData"), "batch-labs"));

/**
 * Setup a few extension functions
 */
import "common/extensions";

import { logger } from "client/logger";
import { startBatchLabs } from "./startup";

startBatchLabs().catch((e) => {
    logger.error("Error starting batchlabs", e);
});
