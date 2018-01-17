import { Injectable } from "@angular/core";
import * as path from "path";
import { BehaviorSubject, Observable } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { FileSystemService } from "app/services";
import { Constants } from "app/utils";
import { MaterialPalette, Theme } from "./theme.model";

/**
 * Service handling theme selection
 */
@Injectable()
export class ThemeService {
    public defaultTheme = "classic";
    public currentTheme: Observable<Theme>;
    private _currentTheme = new BehaviorSubject(null);
    constructor(private fs: FileSystemService) {
        this.currentTheme = this._currentTheme.filter(x => x !== null);
    }

    public init() {
        this.setTheme(this.defaultTheme);
    }

    public async setTheme(name: string) {
        const theme = await this._loadTheme(name);
        this._currentTheme.next(theme);
        this._applyTheme(theme);
    }

    private async _loadTheme(name: string): Promise<Theme> {
        const filePath = path.join(Constants.Client.resourcesFolder, "app", "assets", "themes", `${name}.json`);
        const content = await this.fs.readFile(filePath);

        console.log("Content", content);
        return new Theme(JSON.parse(stripJsonComments(content)));
    }

    private _applyTheme(theme: Theme) {
        this._applyMaterialPalette("primary", theme.primary);
        this._applyMaterialPalette("danger", theme.danger);
        this._applyMaterialPalette("warn", theme.warn);
        this._applyMaterialPalette("success", theme.success);
        // this._applyVar(`--primary`, theme.primary);
    }

    private _applyMaterialPalette(color, palette: MaterialPalette) {
        this._applyVar(`--${color}-50`, palette[50]);
        this._applyVar(`--${color}-100`, palette[100]);
        this._applyVar(`--${color}-200`, palette[200]);
        this._applyVar(`--${color}-300`, palette[300]);
        this._applyVar(`--${color}-400`, palette[400]);
        this._applyVar(`--${color}-500`, palette[500]);
        this._applyVar(`--${color}-600`, palette[600]);
        this._applyVar(`--${color}-700`, palette[700]);
        this._applyVar(`--${color}-800`, palette[800]);
        this._applyVar(`--${color}-900`, palette[900]);
        this._applyVar(`--${color}-A100`, palette.A100);
        this._applyVar(`--${color}-A200`, palette.A200);
        this._applyVar(`--${color}-A400`, palette.A400);
        this._applyVar(`--${color}-A700`, palette.A700);
    }

    private _applyVar(varName: string, value: string) {
        document.documentElement.style.setProperty(varName, value);
    }
}
