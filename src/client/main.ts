import * as path from "path";
process.env.NODE_PATH = path.join(__dirname, "..");
// tslint:disable-next-line:no-var-requires
require("module").Module._initPaths();

import { logger } from "client/logger";
import { startBatchLabs } from "./startup";

startBatchLabs().catch((e) => {
    logger.error("Error starting batchlabs", e);
});
