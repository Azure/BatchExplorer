import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testPathIgnorePatterns: ["/utils/"],
};
export default config;
