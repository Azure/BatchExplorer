import * as bunyan from "bunyan";

export const logger = bunyan.createLogger({ name: "BatchExplorer Main", level: "debug" });
export const renderLogger = bunyan.createLogger({ name: "BatchExplorer Render", level: "debug" });
