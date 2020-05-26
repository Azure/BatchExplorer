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
        // tslint:disable-next-line:no-console
        console.log("User path: ", await app.electron.remote.app.getPath("userData"));
    });

    afterEach(() => {
        if (!process.env.SPECTRON_NO_CLEANUP) {
            if (app && app.isRunning()) {
                return app.stop();
            }
        }
    });

    it("Show the splash screen, auth window then login", async () => {
        console.log("Start println debugging");
        const windowCount = await app.client.getWindowCount();
        console.log("1");
        // Splash screen + Auth window + Main window
        expect(windowCount).toEqual(3);

        console.log("2");
        await app.client.windowByIndex(MAIN_WINDOW_INDEX);
        console.log("3");
        expect(await app.browserWindow.isVisible()).toBe(false);
        console.log("4");

        await app.client.windowByIndex(SPLASH_SCREEN_WINDOW_INDEX);
        console.log("5");
        expect(await app.browserWindow.isVisible()).toBe(true);
        console.log("6");
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 340,
            height: 340,
        }));
        console.log("7");

        await app.client.waitUntilTextExists("#message", "Prompting for user input");
        console.log("8");
        await app.client.windowByIndex(AUTH_WINDOW_INDEX);
        console.log("9");

        expect(await app.browserWindow.isVisible()).toBe(true);
        console.log("10");
        expect(await app.browserWindow.getTitle()).toEqual("BatchExplorer: Login to Azure Public(Default)");
        console.log("11");
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 800,
            height: 700,
        }));
        console.log("12");

        await signIn(app.client);
        console.log("13");
        await app.client.waitUntil(async () => {
            return await app.client.getWindowCount() === 1;
        });
        console.log("14");

        await app.client.windowByIndex(MAIN_WINDOW_INDEX);
        console.log("15");
        expect(await app.browserWindow.isVisible()).toBe(true);
        console.log("16");
        expect(await app.browserWindow.getTitle()).toEqual("Batch Explorer");
        console.log("17");
        await app.client.waitUntilTextExists("bl-account-list .quick-list-row-title", "0prodtest", 60_000);
        console.log("18");

    });

});

/**
 * Method that is going throught he signing experience
 * @param client
 */
async function signIn(client: SpectronClient) {
    const email = process.env.SPECTRON_AAD_USER_EMAIL;
    const password = process.env.SPECTRON_AAD_USER_PASSWORD || "foobar";

    expect(email).toBeTruthy("Should have an email provided");
    expect(password).toBeTruthy("Should have a password provided");

    if (!email || !password) { return; }

    await client.element(`input[type="email"]`).setValue(email);
    await client.element(`input[type="submit"]`).click();
    await delay(5000);
    const url = await client.url();
    if (url.value.startsWith("https://msft.sts.microsoft.com")) {
        await client.element(`#loginMessage .actionLink`).click(); // Click on "Sign with email or passwork instead"
    }
    await client.element(`input[type="password"]`).setValue(password);
    await client.element(`#submitButton`).click();
}

function delay(time?: number) {
    return new Promise(r => setTimeout(r, time));
}
