/**
 * Add the src/ folder to the NODE_PATH to be able to do absolute import(Relative to src folder)
 * Make sure you import this file before any client imports
 */
import * as path from "path";
process.env.NODE_PATH = path.join(__dirname, "..");
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module").Module._initPaths();
