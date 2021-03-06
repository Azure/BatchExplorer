import { Application, SpectronClient } from "spectron";
import { getExePath } from "./utils";

describe("Bundled application is starting correctly", () => {
    let app: Application;
    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 9_990_000;
    });

    beforeEach(async () => {
        app = new Application({
            path: getExePath(),
            args: ["--insecure-test"],
            startTimeout: 3000,
            waitTimeout: 20000,
        });

        await app.start();
        // eslint-disable-next-line no-console
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
        await delay(2_000);

        // Splash screen + Auth window + Main window
        expect(await app.client.getWindowCount()).toEqual(3);

        await switchToWindow(app, WindowType.main);
        expect(await app.browserWindow.isVisible()).toBe(false);

        await switchToWindow(app, WindowType.splash);
        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 340,
            height: 340,
        }));

        await app.client.waitUntilTextExists("#message", "Prompting for user input");
        await switchToWindow(app, WindowType.auth);

        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getTitle()).toEqual("BatchExplorer: Login to Azure Public(Default)");
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 800,
            height: 700,
        }));

        await signIn(app.client);
        await app.client.waitUntil(async () => {
            return await app.client.getWindowCount() === 1;
        });

        await switchToWindow(app, WindowType.main);

        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getTitle()).toEqual("Batch Explorer");
        await app.client.waitUntilTextExists("bl-account-list .quick-list-row-title", "0prodtest", 60_000);

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

    const emailInput = await client.$(`input[type="email"]`);
    await emailInput.setValue(email);

    const nextButton = await client.$(`input[type="submit"]`);
    await nextButton.click();

    await delay(5000);

    const url = await client.getUrl();

    if (url.startsWith("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")) {
        // Click on "Sign with email or passwork instead"
        const signInWithEmailOrPasswordLink =
            await client.$("#redirectToIdpLink");
        await signInWithEmailOrPasswordLink.click();
    } else if (url.startsWith("https://msft.sts.microsoft.com")) {
        // Click on "Sign with email or passwork instead"
        const signInWithEmailOrPasswordLink =
            await client.$("#authOptions .optionButton");
        await signInWithEmailOrPasswordLink.click();
    }

    const pwInput = await client.$(`input[type="password"]`);
    await pwInput.setValue(password);

    const submitButton = await client.$(`#submitButton`);
    await submitButton.click();
}

function delay(time?: number) {
    return new Promise(r => setTimeout(r, time));
}

enum WindowType {
    auth = "auth",
    splash = "splash",
    main = "main"
}

async function switchToWindow(app: Application, type: WindowType) {
    const count = await app.client.getWindowCount();
    const matcher = windowMatcher(type);
    for (let i = 0; i < count; i++) {
        await app.client.windowByIndex(i);
        const url = await app.client.getUrl();
        if (url && matcher(url)) {
            return;
        }
    }
    throw new Error(`Could not find window ${type}`);
    }

function windowMatcher(type: WindowType) {
    switch (type) {
        case WindowType.main:
            return url => url.endsWith("index.html#/accounts");
        case WindowType.splash:
            return url => url.endsWith("splash-screen.html");
        case WindowType.auth:
            return url => url.startsWith("https://login.microsoftonline.com");
    }
}
