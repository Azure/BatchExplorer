import { Application, SpectronClient } from "spectron";
import { getExePath } from "./utils";

const MAIN_WINDOW_INDEX = 0;
const SPLASH_SCREEN_WINDOW_INDEX = 1;
const AUTH_WINDOW_INDEX = 2;

describe("Bundled application is starting correctly", () => {
    let app: Application;
    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 9_990_000;
    });

    beforeEach(async () => {
        app = new Application({
            path: getExePath(),
            args: ["--insecure-test"],
            startTimeout: 10000,
            waitTimeout: 10000,
        });
        await app.start();
    });

    afterEach(() => {
        if (!process.env.SPECTRON_NO_CLEANUP) {
            if (app && app.isRunning()) {
                return app.stop();
            }
        }
    });

    it("Show the splash screen and auth window", async () => {
        const windowCount = await app.client.getWindowCount();
        // Splash screen + Auth window + Main window
        expect(windowCount).toEqual(3);

        await app.client.windowByIndex(MAIN_WINDOW_INDEX);
        expect(await app.browserWindow.isVisible()).toBe(false);

        await app.client.windowByIndex(SPLASH_SCREEN_WINDOW_INDEX);
        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 340,
            height: 340,
        }));

        await app.client.waitUntilTextExists("#message", "Prompting for user input");
        await app.client.windowByIndex(AUTH_WINDOW_INDEX);

        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getTitle()).toEqual("BatchExplorer: Login to Azure Public(Default)");
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 800,
            height: 700,
        }));

        await signIn(app.client);
        expect(await app.client.getWindowCount()).toBe(2, "Should have closed the authentiction window");
    });

});

/**
 * Method that is going throught he signing experience
 * @param client
 */
async function signIn(client: SpectronClient) {
    await client.element(`input[type="email"]`).setValue(process.env.SPECTRON_AAD_USER_EMAIL);
    await client.element(`input[type="submit"]`).click();
    await delay(2000);

    const url = await client.url().value;
    if (url.startsWith("https://msft.sts.microsoft.com")) {
        await client.element(`#loginMessage .actionLink`).click(); // Click on "Sign with email or passwork instead"
    }
    await client.element(`input[type="password"]`).setValue(process.env.SPECTRON_AAD_USER_PASSWORD);
    await client.element(`input[type="submit"]`).click();
}

function delay(time?: number) {
    return new Promise(r => setTimeout(r, time));
}
