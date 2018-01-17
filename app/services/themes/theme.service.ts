import { Injectable } from "@angular/core";
import { FSWatcher } from "chokidar";
import * as path from "path";
import { BehaviorSubject, Observable } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { FileSystemService } from "app/services/fs.service";
import { Constants, log } from "app/utils";
import { ColorPalette, EntityColor, Theme } from "./theme.model";

/**
 * Service handling theme selection
 */
@Injectable()
export class ThemeService {
    public defaultTheme = "classic";
    public currentTheme: Observable<Theme>;
    private _currentTheme = new BehaviorSubject(null);
    private _watcher: FSWatcher;
    constructor(private fs: FileSystemService) {
        this.currentTheme = this._currentTheme.filter(x => x !== null);
        this.currentTheme.subscribe((theme) => {
            this._applyTheme(theme);
        });
    }

    public init() {
        this.setTheme(this.defaultTheme);
    }

    public async setTheme(name: string) {
        const theme = await this._loadTheme(name);
        this._currentTheme.next(theme);
    }

    private async _loadTheme(name: string): Promise<Theme> {
        const filePath = path.join(Constants.Client.resourcesFolder, "app", "assets", "themes", `${name}.json`);
        const theme = await this._loadThemeAt(filePath);
        this._watchThemeFile(filePath);
        return theme;
    }

    private async _loadThemeAt(filePath: string) {
        const content = await this.fs.readFile(filePath);
        return new Theme(JSON.parse(stripJsonComments(content)));
    }

    private _watchThemeFile(filePath: string) {
        if (this._watcher) {
            this._watcher.close();
        }
        this._watcher = this.fs.watch(filePath);
        this._watcher.on("change", async () => {
            log.info("[BatchLabs] Theme file updated. Reloading theme.");
            const theme = await this._loadThemeAt(filePath);
            this._currentTheme.next(theme);
        });
    }

    private _applyTheme(theme: Theme) {
        this._applyColorPalette("primary", theme.primary);
        this._applyColorPalette("danger", theme.danger);
        this._applyColorPalette("warn", theme.warn);
        this._applyColorPalette("success", theme.success);
        this._applyVar(`--primary-text`, theme.text.primary);
        this._applyVar(`--secondary-text`, theme.text.secondary);
        this._applyEntityColor("header", theme.header);
        this._applyEntityColor("navigation", theme.navigation);
        this._applyEntityColor("footer", theme.footer);
        this._applyEntityColor("breadcrumb", theme.breadcrumb);
    }

    private _applyEntityColor(entity: string, theme: EntityColor) {
        this._applyVar(`--color-${entity}-text`, theme.text);
        this._applyVar(`--color-${entity}-background`, theme.background);
        this._applyVar(`--color-${entity}-hover-text`, theme.hoverText);
        this._applyVar(`--color-${entity}-hover-background`, theme.hoverBackground);
    }

    private _applyColorPalette(color, palette: ColorPalette) {
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

        this._applyVar(`--${color}`, palette.main);
        this._applyVar(`--${color}-light`, palette.light);
        this._applyVar(`--${color}-dark`, palette.dark);
    }

    private _applyVar(varName: string, value: string) {
        document.documentElement.style.setProperty(varName, value);
    }
}
