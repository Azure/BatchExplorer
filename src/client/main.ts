/**
 * This file contains code that is initializing the app so the rest of the files run correctly.
 *
 * There is a few steps(IMPORTANT: those steps MUST be run in this exact order):
 *   1. Add the src/ folder to the NODE_PATH to be able to do absolute import(Relative to src folder)
 *   2. Update electron user data folder
 *   3. Initialize the logger
 *   4. Setup extension functions
 *   5. Call startBatchExplorer from startup.ts
 */

// 1. Add the src/ folder to the NODE_PATH to be able to do absolute import(Relative to src folder)
import * as path from "path";
import "./init";

// 2. Update electron user data folder
import { parseArguments } from "./cli";
const program = parseArguments(process.argv);
import { app } from "electron";
const original = app.getPath("userData");
if (program.userDataDir) {
    app.setPath("userData", program.userDataDir);
} else {
    app.setPath("userData", path.join(app.getPath("appData"), "BatchExplorer"));

}

// 3. Initialize the logger
import { initLogger } from "client/logger";
initLogger();

// 4. Setup extension functions
import "reflect-metadata";
import "zone.js";

import "@batch-flask/extensions";

// 5. Call startBatchExplorer from startup.ts
import { log } from "@batch-flask/utils";
import { startBatchExplorer } from "./startup";

log.info("Args: ", process.argv);
log.info("Progran: ", program.userDataDir, program.updated, program.args);
log.info("User data is by default: ", original);
log.info("User data is now: ", app.getPath("userData"));

startBatchExplorer().catch((e) => {
    log.error("Error starting Batch Explorer", e);
});
