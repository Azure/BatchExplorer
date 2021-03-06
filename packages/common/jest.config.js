/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "ui-common",
    require("./tsconfig.json"),
    {
        testEnvironment: "jsdom",
        setupFilesAfterEnv: [
            "<rootDir>/src/ui-common/__tests__/setup-tests.ts",
        ],
    }
);
