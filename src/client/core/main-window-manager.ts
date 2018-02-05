import { MainWindow } from "client/main-window";
import { BatchLabsLink, BatchLabsLinkAttributes, Constants, SecureUtils } from "common";
import { BatchLabsApplication } from "./batchlabs-application";

/**
 * Manage the current window
 */
export class MainWindowManager {
    /**
     * Map of windows currently displayed. Key is a session id either provided by the link or generated
     */
    public windows = new Map<string, MainWindow>();

    constructor(private batchLabsApp: BatchLabsApplication) {
    }

    /**
     * Open a new link in the ms-batchlabs format
     * If the link provide a session id which already exists it will change the window with that session id.
     * @param link ms-batchlabs://...
     */
    public openLink(link: string | BatchLabsLink | BatchLabsLinkAttributes, showWhenReady = true): MainWindow {
        const labsLink = new BatchLabsLink(link);
        const windowId = labsLink.session || SecureUtils.uuid();
        let window: MainWindow;
        if (this.windows.has(windowId)) {
            window = this.windows.get(windowId);
            window.show();
        } else {
            window = this._createNewWindow(windowId, showWhenReady);
        }
        this.goTo(link, window);
        return window;
    }

    /**
     * Open a new link in the ms-batchlabs format
     * @param link ms-batchlabs://...
     */
    public openNewWindow(link?: string | BatchLabsLink | BatchLabsLinkAttributes, showWhenReady = true): MainWindow {
        const window = this._createNewWindow(null, showWhenReady);

        this.goTo(link, window);

        return window;
    }

    public goTo(link: string | BatchLabsLink | BatchLabsLinkAttributes, window: MainWindow) {
        if (!link) { return; }
        const labsLink = new BatchLabsLink(link);
        window.send(Constants.rendererEvents.batchlabsLink, labsLink.toString());
    }
    /**
     * @returns number of opened windows
     */
    public get size() {
        return this.windows.size;
    }

    public hideAll() {
        for (const [_, window] of this) {
            window.hide();
        }
    }

    public showAll() {
        for (const [_, window] of this) {
            window.show();
        }
    }

    public closeAll() {
        for (const [_, window] of this) {
            window.destroy();
        }
    }

    public debugCrash() {
        this.windows.forEach(x => x.debugCrash());
    }

    public [Symbol.iterator]() {
        return this.windows[Symbol.iterator]();
    }

    private _createNewWindow(windowId?: string, showWhenReady = true) {
        windowId = windowId || SecureUtils.uuid();
        const window = new MainWindow(this.batchLabsApp);
        window.create();
        this.windows.set(windowId, window);
        if (showWhenReady) {
            window.appReady.then(() => {
                window.show();
            });
        }
        window.once("closed", () => {
            this.windows.delete(windowId);
        });

        return window;
    }
}
