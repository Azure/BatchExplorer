/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "explorer-web",
    require("./tsconfig.json"),
    {
        testEnvironment: "jsdom",
        setupFilesAfterEnv: [
            "<rootDir>/src/explorer-web/__tests__/setup-tests.ts",
        ],
    }
);
