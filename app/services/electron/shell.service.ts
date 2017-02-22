import { Injectable } from "@angular/core";
import { shell } from "electron";

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable()
export class ElectronShell {
    /**
     * Show the given file in a file manager. If possible, select the file.
     * @returns Whether the item was successfully shown.
     */
    public showItemInFolder(fullPath: string): boolean {
        return shell.showItemInFolder(fullPath);
    }

    /**
     * Open the given file in the desktop's default manner.
     * @returns Whether the item was successfully shown.
     */
    public openItem(fullPath: string): boolean {
        return shell.openItem(fullPath);
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
        return shell.openExternal(url, options);
    }
}
