import { BatchLabsApplication } from ".";
import { logger } from "../logger";

export abstract class GenericWindow {
    public expectedClose = false;
    public domReady: Promise<void>;
    protected _window: Electron.BrowserWindow;
    private _resolveDomReady: () => void;

    constructor(protected batchLabsApp: BatchLabsApplication) {
        this.domReady = new Promise((resolve) => {
            this._resolveDomReady = resolve;
        });
    }

    public create() {
        this.destroy();
        this.expectedClose = true;
        this._window = this.createWindow();
        this._window.webContents.once("dom-ready", () => {
            this._resolveDomReady();
        });
    }

    /**
     * @returns if the window is created
     */
    public exists() {
        return Boolean(this._window);
    }

    public async send(key: string, message: string) {
        if (this._window) {
            await this.domReady;
            this._window.webContents.send(key, message);
        }
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
        this.expectedClose = true;
        if (this._window) {
            this._window.destroy();
            this._window = null;
        }
    }

    protected abstract createWindow(): Electron.BrowserWindow;

}
/**
 * Unique window is a wrapper around a electron browser window which makes sure there is only 1 window of this type.
 */
export abstract class UniqueWindow extends GenericWindow {
    public create() {
        super.create();
        this.setupCommonEvents(this._window);
    }

    public setupCommonEvents(window: Electron.BrowserWindow) {
        window.on("closed", () => {
            if (this.expectedClose) { return; }
            logger.info(`Window ${this.constructor.name} closed. Quiting the app.`);
            this.batchLabsApp.quit();
        });
    }
}
