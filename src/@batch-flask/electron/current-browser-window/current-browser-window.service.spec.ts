import { Subscription } from "rxjs";
import { MockBrowserWindow } from "test/utils/mocks/windows";
import { CurrentBrowserWindow } from "./current-browser-window.service";

describe("CurrentBrowserWindow", () => {
    let window: CurrentBrowserWindow;
    let remoteSpy;
    let electronWindowSpy: MockBrowserWindow;

    beforeEach(() => {
        electronWindowSpy = new MockBrowserWindow();
        remoteSpy = {
            getCurrentWindow: () => electronWindowSpy,
        };
        window = new CurrentBrowserWindow(remoteSpy);
    });

    describe("fullScreen", () => {
        let fullScreen;
        let sub: Subscription;

        beforeEach(() => {
            sub = window.fullScreen.subscribe(x => fullScreen = x);
        });

        afterEach(() => {
            sub.unsubscribe();
        });

        it("is false by default", () => {
            expect(fullScreen).toBe(false);
        });

        it("it is set to true when electron window emit enter-full-screen", () => {
            electronWindowSpy.notify("enter-full-screen", []);
            expect(fullScreen).toBe(true);
            electronWindowSpy.notify("leave-full-screen", []);
            expect(fullScreen).toBe(false);
        });
    });
});
