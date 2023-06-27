/**
 * This gives access to the electron API when using the --insecure-test flag
 */
import { remote } from "electron";

if (remote.process.argv.includes("--insecure-test")) {
    (window as any).require = require;
}
