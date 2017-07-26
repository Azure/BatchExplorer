import { Injectable } from "@angular/core";
import { FileSystemService } from "app/services";
import { List } from "immutable";
import * as path from "path";
import { AsyncSubject, Observable } from "rxjs";

import { Application, ApplicationAction } from "app/models";
import { DateUtils, log } from "app/utils";

const branch = "ncj";
const repo = "BatchLabs-data";
const dataUrl = `https://github.com/Azure/${repo}/archive/${branch}.zip`;
const cacheTime = 1; // In days

interface SyncFile {
    lastSync: Date;
}

@Injectable()
export class NcjTemplateService {
    private _ready = new AsyncSubject();

    constructor(private fs: FileSystemService) { }

    public init() {
        const tmpZip = path.join(this.fs.commonFolders.temp, "batch-labs-data.zip");
        const dest = this._repoDownloadRoot;

        this._checkIfDataNeedReload().then((needReload) => {
            if (!needReload) {
                return null;
            }
            return this.fs.download(dataUrl, tmpZip).then(() => {
                return this.fs.unzip(tmpZip, dest);
            }).then(() => {
                return this._saveSyncData();
            });
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
            const promise = this.fs.readFile(this.getFullPath(uri)).then(data => JSON.parse(data));
            return Observable.fromPromise(promise);
        }).share();
    }

    public getFullPath(uri: string) {
        return path.join(this._dataRoot, uri);
    }

    public listApplications(): Observable<List<Application>> {
        return this.get("index.json").map((apps) => {
            return List<Application>(apps.map(data => {
                return new Application({ ...data, icon: this.getApplicationIcon(data.id) });
            }));
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

    public getTemplates(applicationId: string, actionId: string): Observable<any> {
        const job = this.get(`${applicationId}/${actionId}/job.template.json`);
        const pool = this.get(`${applicationId}/${actionId}/pool.template.json`);

        return Observable.combineLatest(job, pool).map((data) => {
            return {
                job: data[0],
                pool: data[1],
            };
        }).share();
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

    private _saveSyncData(): Promise<string> {
        const syncFile = this._syncFile;
        const data: SyncFile = {
            lastSync: new Date(),
        };
        const content = JSON.stringify(data);
        return this.fs.saveFile(syncFile, content);
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
