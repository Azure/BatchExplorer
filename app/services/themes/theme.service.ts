import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { FSWatcher } from "chokidar";
import * as path from "path";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

import { MonacoLoader } from "@batch-flask/ui/editor";
import { NotificationService } from "@batch-flask/ui/notifications";
import { FileSystemService } from "app/services/fs.service";
import { log } from "app/utils";
import { BatchLabsService } from "../batch-labs.service";
import { SettingsService } from "../settings.service";
import { Theme } from "./theme.model";

/**
 * Service handling theme selection
 */
@Injectable()
export class ThemeService implements OnDestroy {
    public baseTheme = "classic";
    public defaultTheme = "classic";
    public currentTheme: Observable<Theme>;
    private _currentTheme = new BehaviorSubject<Theme>(null);
    private _currentThemeName = null;
    private _watcher: FSWatcher;
    private _themesLoadPath: string[];
    private _baseThemeDefinition;
    private _subs: Subscription[] = [];

    constructor(
        private fs: FileSystemService,
        private notificationService: NotificationService,
        private settingsService: SettingsService,
        private zone: NgZone,
        private monacoLoader: MonacoLoader,
        batchLabs: BatchLabsService) {

        (window as any).setTheme = (val) => {
            this.setTheme(val);
        };
        this.currentTheme = this._currentTheme.filter(x => x !== null);
        this._subs.push(this.currentTheme.subscribe((theme) => {
            this._applyTheme(theme);
        }));

        this._subs.push(this.settingsService.settingsObs.subscribe((settings) => {
            const themeName = settings.theme || this.defaultTheme;
            this.setTheme(themeName);
        }));

        this._themesLoadPath = [
            path.join(batchLabs.resourcesFolder, "data", "themes"),
            path.join(fs.commonFolders.userData, "themes"),
        ];
    }

    public async init() {
        this._baseThemeDefinition = await this._loadTheme(this.baseTheme);
        await this.setTheme(this.defaultTheme);
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public async setTheme(name: string) {
        if (this._currentThemeName === name) { return; }
        this._currentThemeName = name;
        const theme = await this._loadTheme(name);
        this._setTheme(theme);
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

    private _setTheme(theme: Theme) {
        const computedTheme = new Theme({} as any).merge(this._baseThemeDefinition).merge(theme);
        this._currentTheme.next(computedTheme);
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
                this._setTheme(theme);
            });
        });
    }

    private _applyTheme(theme: Theme) {
        for (const entry of theme.asCss()) {
            this._applyCss(entry);
        }
        this.monacoLoader.setTheme(theme.editor);
    }

    private _applyCss({ key, value }) {
        this._applyVar(`--color-${key}`, value);
    }

    private _applyVar(varName: string, value: string) {
        document.documentElement.style.setProperty(varName, value);
    }
}
