import { remote } from "electron";
let logger = (remote.getCurrentWindow() as any).logger;
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
