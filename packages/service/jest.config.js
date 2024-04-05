/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "ui-service",
    {
        setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup-tests.ts"],
    }
);
