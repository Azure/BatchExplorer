import { ProgressInfo } from "builder-util-runtime";
import { UpdateInfo } from "electron-updater";
import { Observable } from "rxjs";

export enum UpdateStatus {
    Checking,
    Downloading,
    Ready,
    NotAvailable,
}

export abstract class AutoUpdateService {
    public status: Observable<UpdateStatus>;
    /**
     * Progress of the download if applicable
     */
    public downloadProgress: Observable<ProgressInfo | null>;

    public updateInfo: UpdateInfo = null;

    public abstract disable();
    public abstract set autoInstallOnAppQuit(value: boolean);
    public abstract setFeedUrl(value: string);
    public abstract quitAndInstall();
    public abstract checkForUpdates();

}
