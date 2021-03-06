import { Injectable } from "@angular/core";
import { clipboard } from "electron";

@Injectable({providedIn: "root"})
export class ClipboardService {
    private _clipboard: Electron.Clipboard;

    constructor() {
        this._clipboard = clipboard;
    }

    public writeText(text: string) {
        this._clipboard.writeText(text);
    }

    public writeHTML(html: string) {
        this._clipboard.writeHTML(html);
    }
}
