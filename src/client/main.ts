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
import "@batch-flask/extensions";
import { log } from "@batch-flask/utils";
import { initLogger } from "client/logger";
import { app } from "electron";
import * as path from "path";
import "reflect-metadata";
import "zone.js";
import { parseArguments } from "./cli";
import "./init";
import { startBatchExplorer } from "./startup";

startBatchExplorer().catch((e) => {
    log.error("Error starting Batch Explorer", e);
});
