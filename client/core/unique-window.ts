/**
 * Unique window is a wrapper around a electron browser window which makes sure there is only 1 window of this type.
 */
export abstract class UniqueWindow {
    protected _window: Electron.BrowserWindow;

    public create() {
        this.destroy();
        this._window = this.createWindow();
    }

    public isVisible(): boolean {
        return this._window && this._window.isVisible();
    }

    public show() {
        if (!this._window) {
            this.create();
        }
        if (!this._window.isVisible()) {
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

    protected abstract createWindow(): Electron.BrowserWindow;

}
