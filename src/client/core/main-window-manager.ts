import { SecureUtils, log } from "@batch-flask/utils";
import { TelemetryManager } from "client/core/telemetry";
import { MainWindow } from "client/main-window";
import { BatchExplorerLink, BatchExplorerLinkAttributes, Constants } from "common";
import { BatchExplorerApplication } from "./batch-explorer-application";

/**
 * Manage the current window
 */
export class MainWindowManager {
    /**
     * Map of windows currently displayed. Key is a session id either provided by the link or generated
     */
    public windows = new Map<string, MainWindow>();

    constructor(private batchExplorerApp: BatchExplorerApplication, private telemetryManager: TelemetryManager) {
    }

    /**
     * Open a new link in the ms-batch-explorer format
     * If the link provide a session id which already exists it will change the window with that session id.
     * @param link ms-batch-explorer://...
     */
    public openLink(link: string | BatchExplorerLink | BatchExplorerLinkAttributes, showWhenReady = true): MainWindow {
        const beLink = new BatchExplorerLink(link);
        const windowId = beLink.session || SecureUtils.uuid();
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
     * Open a new link in the ms-batch-explorer format
     * @param link ms-batch-explorer://...
     */
    public openNewWindow(
        link?: string | BatchExplorerLink | BatchExplorerLinkAttributes,
        showWhenReady = true): MainWindow {
        const window = this._createNewWindow(undefined, showWhenReady);
        this.goTo(link || null, window);

        return window;
    }

    public goTo(link: null | string | BatchExplorerLink | BatchExplorerLinkAttributes, window: MainWindow) {
        if (!link) { return; }
        const beLink = new BatchExplorerLink(link);
        window.send(Constants.rendererEvents.batchExplorerLink, beLink.toString());
    }
    /**
     * @returns number of opened windows
     */
    public get size() {
        return this.windows.size;
    }

    public hideAll() {
        for (const [, window] of this) {
            window.hide();
        }
    }

    public showAll() {
        for (const [, window] of this) {
            window.show();
        }
    }

    public reloadAll() {
        for (const [, window] of this) {
            window.reload();
        }
    }

    public closeAll() {
        for (const [, window] of this) {
            window.close();
        }
    }

    public debugCrash() {
        this.windows.forEach(x => x.debugCrash());
    }

    public [Symbol.iterator]() {
        return this.windows[Symbol.iterator]();
    }

    private _createNewWindow(id?: string, showWhenReady = true) {
        const windowId = id || SecureUtils.uuid();
        const window = new MainWindow(this.batchExplorerApp, this.telemetryManager);
        window.create();
        this.windows.set(windowId, window);
        if (showWhenReady) {
            window.appReady.then(() => {
                window.show();
            });
        }

        window.once("closed", () => {
            this._closeWindow(windowId);
        });

        return window;
    }

    private _closeWindow(windowId: string) {
        const window = this.windows.get(windowId);
        if (window) {
            this.windows.delete(windowId);
            if (window.expectedClose) { return; }
        }
        const visibileWindows = [...this.windows.values()].filter(x => x.isVisible);
        // Check there is at least one more visible window.
        // Some window might still have been loading and are not visible yet
        if (visibileWindows.length > 0) { return; }

        // If no visible window quit the app
        log.info(`Main Window ${this.constructor.name} closed. Quiting the app.`);
        this.batchExplorerApp.quit();
    }
}
