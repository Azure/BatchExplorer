import { BatchLabsApplication } from ".";
import { logger } from "../logger";

/**
 * Unique window is a wrapper around a electron browser window which makes sure there is only 1 window of this type.
 */
export abstract class UniqueWindow {
    protected _window: Electron.BrowserWindow;
    constructor(protected batchLabsApp: BatchLabsApplication) { }
    public create() {
        this.destroy();
        this._window = this.createWindow();
    }

    /**
     * @returns if the window is created
     */
    public exists() {
        return Boolean(this._window);
    }

    /**
     * @returns true if the window exists and is visible
     */
    public isVisible(): boolean {
        return Boolean(this._window && this._window.isVisible());
    }

    /**
     * Display the window only if not already visible
     * @param focus If we should focus on the window if it is already visible. @default false
     */
    public show(focus: boolean = false) {
        if (!this._window) {
            this.create();
        }
        if (focus || !this._window.isVisible()) {
            this._window.show();
        }
    }

    public hide() {
        if (this._window) {
            this._window.hide();
        }
    }

    public destroy() {
        if (this._window) {
            this._window.destroy();
            this._window = null;
        }
    }

    public setupCommonEvents(window: Electron.BrowserWindow) {
        window.on("closed", () => {
            logger.info(`Window ${this.constructor.name} closed. Quiting the app.`);
            this.batchLabsApp.quit();
        });
    }
    protected abstract createWindow(): Electron.BrowserWindow;

}
