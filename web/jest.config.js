/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("@batch/common-config/jest-common").createConfig(
    "explorer-web",
    {
        testEnvironment: "jsdom",
        setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup-tests.ts"],
        // Ignore most code coverage as this isn't used in production
        coveragePathIgnorePatterns: ["^(?!.*(application.tsx))"],
    }
);
