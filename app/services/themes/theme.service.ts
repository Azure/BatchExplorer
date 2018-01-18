import { Injectable } from "@angular/core";
import { FSWatcher } from "chokidar";
import * as path from "path";
import { BehaviorSubject, Observable } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { FileSystemService } from "app/services/fs.service";
import { Constants, log } from "app/utils";
import { Theme } from "./theme.model";

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
        for (const entry of theme.asCss()) {
            this._applyCss(entry);
        }
    }

    private _applyCss({ key, value }) {
        this._applyVar(`--color-${key}`, value);
    }

    private _applyVar(varName: string, value: string) {
        document.documentElement.style.setProperty(varName, value);
    }
}
