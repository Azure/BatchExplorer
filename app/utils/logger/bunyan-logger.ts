import { remote } from "electron";
let logger = (<any>remote.getCurrentWindow()).logger;
if (!logger) {
    logger = {
        trace: () => null,
        error: () => null,
        log: () => null,
        warn: () => null,
        info: () => null,
    };
}
export default logger;
