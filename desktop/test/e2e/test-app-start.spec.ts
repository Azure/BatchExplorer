import { ElectronApplication, Page, _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";
import { waitForWindows, WindowType, getWindow } from "./utils";
import AxeBuilder from "@axe-core/playwright";
import * as Axe from "axe-core";
import { convertAxeToSarif } from "axe-sarif-converter";
import path from "path";
import fs from "fs";
import { promisify } from "util";

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

    describe("Accessibility Tests", () => {
        beforeEach(async () => {
            await waitForWindows(app, 4);
        });

        // This test case shows the most basic example: run a scan, fail the test if there are any failures.
        // This is the way to go if you have no known/pre-existing violations you need to temporarily baseline.
        test('accessibility of h1 element', async ({ browserName, page }) => {
            const accessibilityScanResults = await new AxeBuilder({ page })
                // This withTags directive restricts Axe to only run tests that detect known violations of
                // WCAG 2.1 A and AA rules (similar to what Accessibility Insights reports). If you omit
                // this, Axe will additionally run several "best practice" rules, which are good ideas to
                // check for periodically but may report false positives in certain edge cases.
                .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
                .analyze();

            await exportAxeAsSarifTestResult('index-h1-element.sarif', accessibilityScanResults, browserName);

            expect(accessibilityScanResults.violations).toStrictEqual([]);
        });

    })
});

// SARIF is a general-purpose log format for code analysis tools.
//
// Exporting axe results as .sarif files lets our Azure Pipelines build results page show a nice visualization
// of any accessibility failures we find using the Sarif Results Viewer Tab extension
// (https://marketplace.visualstudio.com/items?itemName=sariftools.sarif-viewer-build-tab)
async function exportAxeAsSarifTestResult(sarifFileName: string, axeResults: Axe.AxeResults, browserName: string): Promise<void> {
    // We use the axe-sarif-converter package for the conversion step, then write the results
    // to a file that we'll be publishing from a CI build step in azure-pipelines.yml
    const sarifResults = convertAxeToSarif(axeResults);

    // This directory should be .gitignore'd and should be published as a build artifact in azure-pipelines.yml
    const testResultsDirectory = path.join(__dirname, '..', 'test-results', browserName);
    await promisify(fs.mkdir)(testResultsDirectory, { recursive: true });

    const sarifResultFile = path.join(testResultsDirectory, sarifFileName);
    await promisify(fs.writeFile)(
        sarifResultFile,
        JSON.stringify(sarifResults, null, 2));

    // eslint-disable-next-line no-console
    console.log(`Exported axe results to ${sarifResultFile}`);
}

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
