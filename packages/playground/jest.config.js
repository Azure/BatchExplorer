/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "ui-playground",
    require("./tsconfig"),
    {
        testEnvironment: "jsdom",
        setupFilesAfterEnv: [
            "<rootDir>/src/ui-playground/__tests__/setup-tests.tsx",
        ],
    }
);
