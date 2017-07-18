import { Injectable } from "@angular/core";
import { FileSystemService } from "app/services";
import { List } from "immutable";
import * as path from "path";
import { Observable } from "rxjs";

import { Application } from "app/models";
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
        });
    }

    /**
     * Get a file from the batch data repo relative to the ncj folder.
     * @param path: path to the file
     */
    public get(uri: string): Observable<any> {
        return Observable.fromPromise(this.fs.readFile(this.getFullPath(uri)).then(data => JSON.parse(data)));
    }

    public getFullPath(uri: string) {
        return path.join(this._dataRoot, uri);
    }

    public listApplications(): Observable<List<Application>> {
        return this.get("index.json").map((apps) => {
            return List<Application>(apps.map(x => new Application(x)));
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
