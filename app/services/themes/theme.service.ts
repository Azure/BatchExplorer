import { Injectable, NgZone } from "@angular/core";
import { FSWatcher } from "chokidar";
import * as path from "path";
import { BehaviorSubject, Observable } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { NotificationService } from "@batch-flask/ui/notifications";
import { FileSystemService } from "app/services/fs.service";
import { log } from "app/utils";
import { BatchLabsService } from "../batch-labs.service";
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
    private _themesLoadPath: string[];

    constructor(
        private fs: FileSystemService,
        private notificationService: NotificationService,
        private zone: NgZone,
        batchLabs: BatchLabsService) {
        this.currentTheme = this._currentTheme.filter(x => x !== null);
        this.currentTheme.subscribe((theme) => {
            this._applyTheme(theme);
        });

        this._themesLoadPath = [
            path.join(batchLabs.resourcesFolder, "data", "themes"),
            path.join(fs.commonFolders.userData, "themes"),
        ];
    }

    public init() {
        this.setTheme(this.defaultTheme);
    }

    public async setTheme(name: string) {
        const theme = await this._loadTheme(name);
        this._currentTheme.next(theme);
    }

    public async findThemeLocation(name: string): Promise<string> {
        const triedLocations = [];
        for (const loadPath of this._themesLoadPath) {
            const filePath = path.join(loadPath, `${name}.json`);
            triedLocations.push(filePath);
            if (await this.fs.exists(filePath)) {
                return filePath;
            }
        }
        throw new Error(`Cannot find theme ${name}. Tried ${triedLocations.join(", ")}`);
    }

    private async _loadTheme(name: string): Promise<Theme> {
        let filePath;
        try {
            filePath = await this.findThemeLocation(name);
        } catch (e) {
            this._notifyErrorLoadingTheme(e.message);
            return null;
        }
        const theme = await this._loadThemeAt(filePath);
        this._watchThemeFile(filePath);
        return theme;
    }

    private async _loadThemeAt(filePath: string) {
        try {
            const content = await this.fs.readFile(filePath);
            return new Theme(JSON.parse(stripJsonComments(content)));
        } catch (e) {
            log.error(`Error loading theme file ${filePath}`, { e });
            this._notifyErrorLoadingTheme(`Theme file ${filePath} contains invalid json`);
            return null;
        }
    }

    private _notifyErrorLoadingTheme(message: string) {
        this.zone.run(() => {
            this.notificationService.warn(`Error loading theme file`, message);
        });
    }

    private _watchThemeFile(filePath: string) {
        if (this._watcher) {
            this._watcher.close();
        }
        this._watcher = this.fs.watch(filePath);
        this._watcher.on("change", async () => {
            log.info("[BatchLabs] Theme file updated. Reloading theme.");
            const theme = await this._loadThemeAt(filePath);
            this.zone.run(() => {
                this._currentTheme.next(theme);
            });
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
