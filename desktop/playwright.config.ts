import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    testDir: "./test/e2e",
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    timeout: 60_000,
    use: {
        trace: "retain-on-failure",
    },
};

export default config;
