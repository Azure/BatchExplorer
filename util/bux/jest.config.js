/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = require("../common-config/jest-common").createConfig(
    "bux",
    require("./tsconfig.json"),
    {
        testMatch: ["<rootDir>/__tests__/**/*.spec.ts"],
    }
);
