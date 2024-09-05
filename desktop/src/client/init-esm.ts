/**
 * Add the src/ folder to the NODE_PATH to be able to do absolute import(Relative to src folder)
 * Make sure you import this file before any client imports
 */
import * as path from "path";

const __filename = new URL('', import.meta.url).pathname;
const __dirname = path.dirname(__filename);

process.env.NODE_PATH = path.join(__dirname, "..");

