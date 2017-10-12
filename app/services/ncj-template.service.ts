import { Injectable } from "@angular/core";
import { FileSystemService, LocalFileStorage } from "app/services";
import { List } from "immutable";
import * as path from "path";
import { AsyncSubject, BehaviorSubject, Observable } from "rxjs";

import { Application, ApplicationAction, NcjJobTemplate, NcjPoolTemplate, NcjTemplateType } from "app/models";
import { DateUtils, SecureUtils, log } from "app/utils";

const branch = "master";
const repo = "BatchLabs-data";
const dataUrl = `https://github.com/Azure/${repo}/archive/${branch}.zip`;
const cacheTime = 1; // In days
const recentSubmitKey = "ncj-recent-submit";
const maxRecentSubmissions = 100;

interface SyncFile {
    lastSync: Date;
}

export interface RecentSubmissionParams {
    name: string;
    jobTemplate?: NcjJobTemplate;
    poolTemplate?: NcjPoolTemplate;
    mode: any;
    jobParams?: StringMap<any>;
    poolParams?: StringMap<any>;
    pickedPool?: string;
}

export interface RecentSubmission extends RecentSubmissionParams {
    id: string;
}

@Injectable()
export class NcjTemplateService {
    public recentSubmission: Observable<RecentSubmission[]>;

    private _ready = new AsyncSubject();
    private _recentSubmission = new BehaviorSubject<RecentSubmission[]>([]);

    constructor(private fs: FileSystemService, private localFileStorage: LocalFileStorage) {
        this.recentSubmission = this._recentSubmission.asObservable();
    }

    public init() {
        this._loadRecentSubmission();
        this._checkIfDataNeedReload().then((needReload) => {
            if (!needReload) {
                return null;
            }
            this._downloadRepo();
        }).then(() => {
            this._ready.next(true);
            this._ready.complete();
        });
    }

    /**
     * Get a file from the batch data repo relative to the ncj folder.
     * @param path: path to the file
     */
    public get(uri: string): Observable<any> {
        return this._ready.flatMap(() => {
            const promise = this.fs.readFile(this.getFullPath(uri)).then(data => {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    log.error(`Error parsing template file ${uri}`);
                }
            });
            return Observable.fromPromise(promise);
        }).share();
    }

    public getFullPath(uri: string) {
        return path.join(this._dataRoot, uri);
    }

    public reloadData() {
        return Observable.fromPromise(this._downloadRepo());
    }

    public listApplications(): Observable<List<Application>> {
        return this.get("index.json").map((apps) => {
            return List<Application>(apps.map(data => {
                return new Application({ ...data, icon: this.getApplicationIcon(data.id) });
            }));
        }).share();
    }

    public getApplication(applicationId: string): Observable<Application> {
        return this.get("index.json").map((apps) => {
            const data = apps.filter(app => app.id === applicationId).first();
            return data && new Application({ ...data, icon: this.getApplicationIcon(data.id) });
        }).share();
    }

    /**
     * Return the application icon path
     * @param applicationId Id of the application
     */
    public getApplicationIcon(applicationId: string): string {
        return "file:" + this.getFullPath(`${applicationId}/icon.svg`);
    }

    public listActions(applicationId: string): Observable<List<ApplicationAction>> {
        return this.get(`${applicationId}/index.json`).map((apps) => {
            return List<ApplicationAction>(apps.map(x => new ApplicationAction(x)));
        }).share();
    }

    public getJobTemplate(applicationId: string, actionId: string): Observable<NcjJobTemplate> {
        return this.get(`${applicationId}/${actionId}/job.template.json`);
    }

    public getPoolTemplate(applicationId: string, actionId: string): Observable<NcjPoolTemplate> {
        return this.get(`${applicationId}/${actionId}/pool.template.json`);
    }

    public async loadLocalTemplateFile(path: string) {
        const content = await this.fs.readFile(path);
        let json;
        try {
            json = JSON.parse(content);
        } catch (error) {
            return Promise.reject(`File is not valid json: ${error.message}`);
        }
        let templateType: NcjTemplateType;
        if (json.job) {
            templateType = NcjTemplateType.job;
        } else if (json.pool) {
            templateType = NcjTemplateType.pool;
        } else {
            templateType = NcjTemplateType.unknown;
        }

        return { type: templateType, template: json };
    }

    public addRecentSubmission(submission: RecentSubmissionParams) {
        const data: RecentSubmission = {
            ...submission,
            id: SecureUtils.uuid(),
        };
        const newSubmissions = [data].concat(this._recentSubmission.value);
        this._recentSubmission.next(newSubmissions.slice(0, maxRecentSubmissions));
        this._saveRecentSubmission();
    }

    public getRecentSubmission(id: string): Observable<RecentSubmission> {
        console.log("Get recent", id);
        return this._ready.map(() => {
            return this._recentSubmission.value.filter(x => x.id === id).first();
        }).shareReplay(1);
    }

    private _checkIfDataNeedReload(): Promise<boolean> {
        const syncFile = this._syncFile;
        return this.fs.exists(syncFile).then((exists) => {
            if (!exists) {
                return Promise.resolve(true);
            }
            return this.fs.readFile(syncFile).then((content) => {
                try {
                    const json: SyncFile = JSON.parse(content);
                    const lastSync = new Date(json.lastSync);
                    return !DateUtils.withinRange(lastSync, cacheTime, "day");
                } catch (e) {
                    log.error("Error reading sync file. Reloading data from github.", e);
                    return Promise.resolve(true);
                }
            });
        });
    }

    private _downloadRepo() {
        const tmpZip = path.join(this.fs.commonFolders.temp, "batch-labs-data.zip");
        const dest = this._repoDownloadRoot;
        return this.fs.download(dataUrl, tmpZip).then(() => {
            return this.fs.unzip(tmpZip, dest);
        }).then(() => {
            return this._saveSyncData();
        });
    }

    private _saveSyncData(): Promise<string> {
        const syncFile = this._syncFile;
        const data: SyncFile = {
            lastSync: new Date(),
        };
        const content = JSON.stringify(data);
        return this.fs.saveFile(syncFile, content);
    }

    private _saveRecentSubmission() {
        return this.localFileStorage.set(recentSubmitKey, this._recentSubmission.value);
    }

    private _loadRecentSubmission() {
        this.localFileStorage.get(recentSubmitKey).subscribe((data: RecentSubmission[]) => {
            if (!Array.isArray(data)) {
                data = [];
            }
            this._recentSubmission.next(data);
        });
    }

    private get _repoDownloadRoot() {
        return path.join(this.fs.commonFolders.temp, "batch-labs-data");
    }

    private get _dataRoot() {
        return path.join(this._repoDownloadRoot, `${repo}-${branch}`, "ncj");
    }

    private get _syncFile() {
        return path.join(this._repoDownloadRoot, "sync.json");
    }
}
