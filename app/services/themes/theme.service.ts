import { Injectable } from "@angular/core";
import * as path from "path";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { FileSystemService } from "app/services";
import { Constants } from "app/utils";
import { ComputedTheme, MaterialPalette, Theme } from "./theme.model";
/**
 * Service handling theme selection
 */
@Injectable()
export class ThemeService {
    public defaultTheme = "classic";

    constructor(private fs: FileSystemService) { }

    public init() {

        this.setTheme(this.defaultTheme);
    }

    public async setTheme(name: string) {
        const theme = await this._loadTheme(name);
        this._applyTheme(theme);
    }

    private async _loadTheme(name: string): Promise<Theme> {
        const filePath = path.join(Constants.Client.resourcesFolder, "app", "assets", "themes", `${name}.json`);
        const content = await this.fs.readFile(filePath);

        console.log("Content", content);
        return JSON.parse(stripJsonComments(content)) as any;
    }

    private _applyTheme(theme: Theme) {
        const computedTheme = new ComputedTheme(theme);
        this._applyMaterialPalette("primary", computedTheme.primary);
        this._applyMaterialPalette("danger", computedTheme.danger);
        this._applyMaterialPalette("warn", computedTheme.warn);
        this._applyMaterialPalette("success", computedTheme.success);
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
