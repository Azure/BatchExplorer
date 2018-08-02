import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { log } from "@batch-flask/utils";
import { Constants, DateUtils } from "app/utils";
import * as path from "path";
import { AsyncSubject, Observable, Subscription } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { FileSystemService } from "../fs.service";
import { SettingsService } from "../settings.service";

const repo = "BatchExplorer-data";
const cacheTime = 1; // In days

interface SyncFile {
    lastSync: Date;
    source: string;
}

@Injectable()
export class GithubDataService implements OnDestroy {
    public ready: Observable<any>;
    private _ready = new AsyncSubject();

    private _branch = null;
    private _settingsSub: Subscription;
    private _settingsLoaded: Observable<any>;

    constructor(
        private http: HttpClient,
        private fs: FileSystemService,
        private settingsService: SettingsService) {
        this.ready = this._ready.asObservable();
    }

    public init() {
        const obs = this.settingsService.settingsObs;
        this._settingsLoaded = obs.take(1);
        this._settingsSub = obs.subscribe((settings) => {
            const branch = settings["github-data.source.branch"];
            if (!branch || branch === this._branch) { return; }
            this._branch = branch;
            this._updateLocalData();
        });
    }

    public reloadData(): Observable<any> {
        this._ready = new AsyncSubject();
        return from(this._downloadRepo());
    }

    public ngOnDestroy() {
        this._settingsSub.unsubscribe();
    }

    /**
     * Get the content of the file in github
     * @param path path relative to the root of the repo
     */
    public get(path: string): Observable<string> {
        return this._settingsLoaded.pipe(
            flatMap(() => this.http.get(this.getUrl(path), { observe: "body", responseType: "text" })),
            share(),
        );
    }

    /**
     * Get the remote url for the file
     * @param path path relative to the root of the repo
     */
    public getUrl(path: string): string {
        return `${this._repoUrl}/${path}`;
    }

    public getLocalPath(uri: string) {
        return path.join(this._dataRoot, uri);
    }

    private get _repoUrl() {
        return `${Constants.ServiceUrl.githubRaw}/Azure/${repo}/${this._branch}`;
    }

    private async _checkIfDataNeedReload(): Promise<boolean> {
        const syncFile = this._syncFile;
        const exists = await this.fs.exists(syncFile);
        if (!exists) {
            return true;
        }
        const content = await this.fs.readFile(syncFile);
        try {
            const json: SyncFile = JSON.parse(content);
            const lastSync = new Date(json.lastSync);
            return json.source !== this._zipUrl || !DateUtils.withinRange(lastSync, cacheTime, "day");
        } catch (e) {
            log.error("Error reading sync file. Reloading data from github.", e);
            return Promise.resolve(true);
        }
    }

    private async _downloadRepo() {
        const tmpZip = path.join(this.fs.commonFolders.temp, "batch-labs-data.zip");
        const dest = this._repoDownloadRoot;
        await this.fs.download(this._zipUrl, tmpZip);
        await this.fs.unzip(tmpZip, dest);
        await this._saveSyncData(this._zipUrl);

        this._ready.next(true);
        this._ready.complete();
    }

    private _saveSyncData(source: string): Promise<string> {
        const syncFile = this._syncFile;
        const data: SyncFile = {
            source,
            lastSync: new Date(),
        };
        const content = JSON.stringify(data);
        return this.fs.saveFile(syncFile, content);
    }

    private get _repoDownloadRoot() {
        return path.join(this.fs.commonFolders.temp, "batch-labs-data");
    }

    private get _dataRoot() {
        return path.join(this._repoDownloadRoot, `${repo}-${this._branch}`, "ncj");
    }

    private get _zipUrl() {
        return `https://github.com/Azure/${repo}/archive/${this._branch}.zip`;
    }

    private get _syncFile() {
        return path.join(this._repoDownloadRoot, "sync.json");
    }

    private async _updateLocalData() {
        const needReload = await this._checkIfDataNeedReload();
        if (!needReload) {
            this._ready.next(true);
            this._ready.complete();
            return null;
        }
        await this._downloadRepo();
    }
}
