import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { FileSystemService, LoadingStatus } from "@batch-flask/ui";
import { DateUtils, log } from "@batch-flask/utils";
import { Constants } from "common";
import * as path from "path";
import { BehaviorSubject, Observable, Subscription, from } from "rxjs";
import { filter, flatMap, share, take } from "rxjs/operators";
import { SettingsService } from "../settings.service";

const cacheTime = 1; // In days

interface SyncFile {
    lastSync: Date;
    source: string;
}

@Injectable({providedIn: "root"})
export class GithubDataService implements OnDestroy {
    private _branch = null;
    private _repo = null;
    private _settingsSub: Subscription;
    private _settingsLoaded: Observable<any>;
    private _loadingStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);

    constructor(
        private http: HttpClient,
        private fs: FileSystemService,
        private settingsService: SettingsService) {
    }

    public ngOnDestroy() {
        if (this._settingsSub) {
            this._settingsSub.unsubscribe();
        }
        this._loadingStatus.complete();
    }

    public get ready(): Observable<any> {
        return this._loadingStatus.pipe(
            filter(x => x === LoadingStatus.Ready),
            take(1),
        );
    }

    public init() {
        const obs = this.settingsService.settingsObs;
        this._settingsLoaded = obs.pipe(take(1));
        this._settingsSub = obs.subscribe((settings) => {
            const branch = settings["github-data.source.branch"];
            const repo = settings["github-data.source.repo"];
            if (!branch || !repo || (branch === this._branch && repo === this._repo)) { return; }
            this._branch = branch;
            this._repo = repo;
            this._updateLocalData();
        });
    }

    public reloadData(): Observable<any> {
        this._loadingStatus.next(LoadingStatus.Loading);
        return from(this._downloadRepo());
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
        return `${Constants.ServiceUrl.githubRaw}/${this._repo}/${this._branch}`;
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
        const tmpZip = path.join(this.fs.commonFolders.temp, "batch-explorer-data.zip");
        const dest = this._repoDownloadRoot;
        await this.fs.download(this._zipUrl, tmpZip);
        await this.fs.unzip(tmpZip, dest);
        await this._saveSyncData(this._zipUrl);

        this._loadingStatus.next(LoadingStatus.Ready);
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
        return path.join(this.fs.commonFolders.temp, "batch-explorer-data");
    }

    private get _dataRoot() {
        const repo = this._repo && this._repo.split("/")[1];
        return path.join(this._repoDownloadRoot, `${repo}-${this._branch}`, "ncj");
    }

    private get _zipUrl() {
        return `https://github.com/${this._repo}/archive/${this._branch}.zip`;
    }

    private get _syncFile() {
        return path.join(this._repoDownloadRoot, "sync.json");
    }

    private async _updateLocalData() {
        this._loadingStatus.next(LoadingStatus.Loading);
        const needReload = await this._checkIfDataNeedReload();
        if (!needReload) {
            this._loadingStatus.next(LoadingStatus.Ready);
            return null;
        }
        await this._downloadRepo();
    }
}
