import { Application } from "spectron";
import { getExePath } from "./utils";

const MAIN_WINDOW_INDEX = 0;
const SPLASH_SCREEN_WINDOW_INDEX = 1;
// const AUTH_WINDOW_INDEX = 2;

describe("Bundled application is starting correctly", () => {
    let app: Application;
    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    beforeEach(async () => {
        app = new Application({
            path: getExePath(),
            startTimeout: 10000,
            waitTimeout: 10000,
        });
        await app.start();
    });

    afterEach(() => {
        if (app && app.isRunning()) {
            return app.stop();
        }
    });

    it("doesn't show the main window", async () => {
        await app.client.windowByIndex(MAIN_WINDOW_INDEX);
        expect(await app.browserWindow.isVisible()).toBe(false);
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 1600,
            height: 1000,
        }));
    });

    it("Start and show the splash screen", async () => {
        const windowCount = await app.client.getWindowCount();
        // Splash screen + Auth window + Main window
        expect(windowCount).toEqual(3);

        await app.client.windowByIndex(SPLASH_SCREEN_WINDOW_INDEX);
        expect(await app.browserWindow.isVisible()).toBe(true);
        expect(await app.browserWindow.getBounds()).toEqual(jasmine.objectContaining({
            width: 340,
            height: 340,
        }));
    });

});
