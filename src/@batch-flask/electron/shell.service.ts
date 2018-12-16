import { Injectable } from "@angular/core";
import { SanitizedError } from "@batch-flask/utils";

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable({providedIn: "root"})
export class ElectronShell {
    private _shell: Electron.Shell;
    constructor() {
        this._shell = require("electron").shell;
    }
    /**
     * Show the given file in a file manager. If possible, select the file.
     * @returns Whether the item was successfully shown.
     */
    public showItemInFolder(fullPath: string): boolean {
        return this._shell.showItemInFolder(fullPath);
    }

    /**
     * Open the given file in the desktop's default manner.
     * @returns Whether the item was successfully shown.
     */
    public openItem(fullPath: string): boolean {
        return this._shell.openItem(fullPath);
    }

    /**
     * Open the given external protocol URL in the desktop's default manner
     * (e.g., mailto: URLs in the default mail user agent).
     * @returns Whether an application was available to open the URL.
     */
    public openExternal(url: string, options?: {
        /**
         * Bring the opened application to the foreground.
         * Default: true.
         */
        activate: boolean;
    }): boolean {
        if (!url.startsWith("https://")) {
            throw new SanitizedError("Do not use electron external with something else than urls."
                + " It could be used to run commands on osx for example.\n"
                + " Use openItem for opening a local file instead");
        }
        return this._shell.openExternal(url, options);
    }
}
