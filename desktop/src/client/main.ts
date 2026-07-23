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

// 0. Load the Angular JIT compiler BEFORE any Angular library code is evaluated.
// The main process is bundled with ts-loader (no AOT/linker step, unlike the
// renderer's AngularWebpackPlugin), so Angular's partially-compiled libraries and
// the client NgModule (bootstrapped via platformServer().bootstrapModule) are
// compiled with JIT at runtime. This replaces the removed `platformDynamicServer`.
import "@angular/compiler";

// 1. Add the src/ folder to the NODE_PATH to be able to do absolute import(Relative to src folder)
import * as path from "path";
import "./init";

// 2. Update electron user data folder
import { parseArguments } from "./cli";
const program = parseArguments(process.argv);
import { app } from "electron";

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

startBatchExplorer(program).catch((e) => {
    log.error("Error starting Batch Explorer", e);
});
