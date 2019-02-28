import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { UserConfigurationService } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { NotificationService } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { FSWatcher } from "chokidar";
import { BEUserConfiguration } from "common";
import * as path from "path";
import { BehaviorSubject, Observable, Subject, combineLatest } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { Theme } from "./theme.model";

// tslint:disable-next-line:no-var-requires
const stripJsonComments = require("strip-json-comments");

export class ThemeNotFoundError extends Error {

}

/**
 * Service handling theme selection
 */
@Injectable({providedIn: "root"})
export class ThemeService implements OnDestroy {
    public baseTheme = "classic";
    public defaultTheme = "classic";
    public currentTheme: Observable<Theme>;
    private _currentTheme = new BehaviorSubject<Theme>(null);
    private _currentThemeName = null;
    private _watcher: FSWatcher;
    private _themesLoadPath: string[];
    private _baseThemeDefinition: Promise<Theme>;
    private _destroy = new Subject();

    constructor(
        private fs: FileSystemService,
        private notificationService: NotificationService,
        private settingsService: UserConfigurationService<BEUserConfiguration>,
        private zone: NgZone,
        batchExplorer: BatchExplorerService) {

        (window as any).setTheme = (val) => {
            this.setTheme(val);
        };

        this.currentTheme = this._currentTheme.pipe(filter(x => x !== null));
        this.currentTheme.pipe(takeUntil(this._destroy)).subscribe((theme) => {
            this._applyTheme(theme);
        });

        combineLatest(this.settingsService.config, batchExplorer.isOSHighContrast)
            .pipe(takeUntil(this._destroy))
            .subscribe(([settings, isHighContrast]) => {
                if (isHighContrast) {
                    this.setTheme("high-contrast");
                } else {
                    const themeName = settings.theme || this.defaultTheme;
                    this.setTheme(themeName);
                }
            });

        this._themesLoadPath = [
            path.join(batchExplorer.resourcesFolder, "data", "themes"),
            path.join(fs.commonFolders.userData, "themes"),
        ];
    }

    public async init() {
        this._baseThemeDefinition = this._loadTheme(this.baseTheme);
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public async setTheme(name: string) {
        if (this._currentThemeName === name) { return; }
        this._currentThemeName = name;
        const theme = await this._loadTheme(name);
        await this._setTheme(theme);
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
        throw new ThemeNotFoundError(`Cannot find theme ${name}. Tried ${triedLocations.join(", ")}`);
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

    private async _setTheme(theme: Theme) {
        const computedTheme = new Theme({} as any).merge(await this._baseThemeDefinition).merge(theme);
        computedTheme.isHighContrast = theme.isHighContrast;
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
            log.info("[BatchExplorer] Theme file updated. Reloading theme.");
            const theme = await this._loadThemeAt(filePath);
            this.zone.run(() => {
                this._setTheme(theme);
            });
        });
    }

    private async _applyTheme(theme: Theme) {
        for (const entry of theme.asCss()) {
            this._applyCss(entry);
        }
        const monaco = await import("monaco-editor");
        monaco.editor.setTheme(theme.editor);
    }

    private _applyCss({ key, value }) {
        this._applyVar(`--color-${key}`, value);
    }

    private _applyVar(varName: string, value: string) {
        document.documentElement.style.setProperty(varName, value);
    }
}
