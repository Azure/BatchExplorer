/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "ui-react",
    require("./tsconfig"),
    {
        testEnvironment: "jsdom",
        setupFilesAfterEnv: ["<rootDir>/src/ui-react/__tests__/setup-tests.ts"],
    }
);
