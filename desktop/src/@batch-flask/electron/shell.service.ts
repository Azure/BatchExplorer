import { Injectable } from "@angular/core";
import { SanitizedError } from "@batch-flask/utils";
import { shell } from "electron";

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable({providedIn: "root"})
export class ElectronShell {
    private _shell: Electron.Shell;
    constructor() {
        this._shell = shell;
    }
    /**
     * Show the given file in a file manager. If possible, select the file.
     */
    public showItemInFolder(fullPath: string): void {
        this._shell.showItemInFolder(fullPath);
    }

    /**
     * Open the given file in the desktop's default manner.
     * @returns A result object which contains a boolean that indicates
     *          whether the item was successfully shown, and an error
     *          message (which defaults to "" if success is true)
     */
    public async openItem(fullPath: string): Promise<{success: boolean, errorMessage: string}> {
        const result = await this._shell.openPath(fullPath);
        return {
            success: result === "",
            errorMessage: result,
        };
    }

    /**
     * Open the given external protocol URL in the desktop's default manner
     * (e.g., mailto: URLs in the default mail user agent).
     */
    public openExternal(url: string, options?: {
        /**
         * Bring the opened application to the foreground.
         * Default: true.
         */
        activate: boolean;
    }): Promise<void> {
        if (!url.startsWith("https://")) {
            throw new SanitizedError("Do not use electron external with something else than urls."
                + " It could be used to run commands on osx for example.\n"
                + " Use openItem for opening a local file instead");
        }
        return this._shell.openExternal(url, options);
    }
}
