import { FileSystemService } from "@batch-flask/electron";
import { LoadingStatus } from "@batch-flask/ui";
import { DateUtils, log } from "@batch-flask/utils";
import * as path from "path";
import { Observable, from } from "rxjs";
import { Portfolio, PortfolioReference } from "./portfolio";

interface SyncFile {
    lastSync: Date;
    source: string;
}

const CACHE_TIME = 1; // In days

export class GithubPortfolio extends Portfolio {
    private _user: string;
    private _repo: string;
    private _branch: string = "master";
    /**
     * Branch name without '/'. They are replaced with '-'
     */
    private _sanitizedBranch: string = "master";

    constructor(ref: PortfolioReference, fs: FileSystemService) {
        super(ref, fs);

        const url = new URL(this.source);
        const segments = url.pathname.slice(1).split("/");
        this._user = segments[0];
        this._repo = segments[1];
        if (segments[2] === "tree" && segments.length > 3) {
            const branchSegements = segments.slice(3);
            this._branch = branchSegements.join("/");
            this._sanitizedBranch = branchSegements.join("-");
        }
    }

    public get path() {
        return path.join(this._repoDownloadRoot, `${this._repo}-${this._sanitizedBranch}`, "ncj");
    }

    protected isReloadNeeded(): Observable<boolean> {
        return from(this._checkIfDataNeedReload());
    }

    protected cache(): Observable<any> {
        return from(this._downloadRepo());
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
            return json.source !== this._zipUrl || !DateUtils.withinRange(lastSync, CACHE_TIME, "day");
        } catch (e) {
            log.error("Error reading sync file. Reloading data from github.", e);
            return Promise.resolve(true);
        }
    }

    private async _downloadRepo() {
        const tmpZip = path.join(this.fs.commonFolders.temp, "portfolios", "zips", `${this.id}.zip`);
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
        return path.join(this.fs.commonFolders.temp, "portfolios", this.id);
    }

    private get _zipUrl() {
        return `https://github.com/${this._user}/${this._repo}/archive/${this._branch}.zip`;
    }

    private get _syncFile() {
        return path.join(this._repoDownloadRoot, "sync.json");
    }

}
