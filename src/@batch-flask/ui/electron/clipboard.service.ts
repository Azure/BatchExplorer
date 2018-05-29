import { Injectable } from "@angular/core";

@Injectable()
export class ClipboardService {
    private _clipbard: Electron.Clipboard;
    constructor() {
        this._clipbard = require("electron").clipboard;
    }

    public writeText(text: string) {
        this._clipbard.writeText(text);
    }

    public writeHTML(html: string) {
        this._clipbard.writeHTML(html);
    }
}
