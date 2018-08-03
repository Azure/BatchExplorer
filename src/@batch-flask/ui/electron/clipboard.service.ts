import { Injectable } from "@angular/core";

@Injectable()
export class ClipboardService {
    private _clipboard: Electron.Clipboard;
    constructor() {
        this._clipboard = require("electron").clipboard;
    }

    public writeText(text: string) {
        this._clipboard.writeText(text);
    }

    public writeHTML(html: string) {
        this._clipboard.writeHTML(html);
    }
}
