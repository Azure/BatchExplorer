/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "ui-service",
    require("./tsconfig.json"),
    {
        setupFilesAfterEnv: [
            "<rootDir>/src/ui-service/__tests__/setup-tests.ts",
        ],
    }
);
