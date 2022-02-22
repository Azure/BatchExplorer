import { ElectronApplication, Page, _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";
import { waitForWindows, WindowType, getWindow } from "./utils";

let app: ElectronApplication;

test.describe("Bundled application is starting correctly", () => {
    test.beforeAll(async () => {
        app = await electron.launch({
            args: ["./build/client/main.js", "--insecure-test"]
        });
    });

    test.afterAll(async () => {
        await app.close();
    });

    test("Check that windows are loaded", async () => {
        await waitForWindows(app, 4);
        expect(await getWindow(app, WindowType.splash)).toBeTruthy();
        expect(await getWindow(app, WindowType.main)).toBeTruthy();
        expect(await getWindow(app, WindowType.auth)).toBeTruthy();
        expect(await getWindow(app, WindowType.devTools)).toBeTruthy();
    });

    test("Log in", async () => {
        const authWindow = await getWindow(app, WindowType.auth);
        expect(await authWindow.title()).toEqual("Sign in to your account");
        await signIn(app, authWindow);
    });

    test("Select an account", async () => {
        const mainWindow = await getWindow(app, WindowType.main);
        await mainWindow.click("bl-account-list bl-quick-list-row-render");
        expect(await mainWindow.innerText(
            "bl-account-list *[aria-selected=true] .quick-list-row-title")
        ).toBe("0prodtest");
        expect(await mainWindow.innerText(
            "bl-account-list *[aria-selected=true] .quick-list-row-state")
        ).toBe("westus");
    });
});

/**
 * Sign in using AAD interactive auth
 *
 * @param app The electron app to use
 */
async function signIn(app: ElectronApplication, authWindow: Page) {
    const email = process.env.BE_TEST_AAD_USER_EMAIL;
    const password = process.env.BE_TEST_AAD_USER_PASSWORD || "foobar";

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    if (!email || !password) { return; }

    await authWindow.fill(`input[type="email"]`, email);

    await authWindow.click(`input[type="submit"]`);

    // Wait until we see one of the valid next URLs
    await authWindow.waitForURL(/(https:\/\/login\.microsoftonline\.com\/common\/oauth2\/v2\.0\/authorize|https:\/\/msft\.sts\.microsoft\.com)/)

    // Click on "Sign with email or password instead"
    if (authWindow.url().startsWith("https://login.microsoftonline.com")) {
        await authWindow.click("#redirectToIdpLink");
    } else if (authWindow.url().startsWith("https://msft.sts.microsoft.com")) {
        await authWindow.click("#authOptions .optionButton");
    }

    await authWindow.fill(`input[type="password"]`, password);

    await authWindow.click("#submitButton");

    const splashWindow = await getWindow(app, WindowType.splash);
    await Promise.all([
        authWindow.waitForEvent("close"),
        splashWindow.waitForEvent("close")
    ]);
}
