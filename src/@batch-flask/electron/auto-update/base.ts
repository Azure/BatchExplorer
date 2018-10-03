import { Observable } from "rxjs";
import { UpdateInfo } from "electron-updater";

export enum UpdateStatus {
    Checking,
    Downloading,
    Ready,
    NotAvailable,
}

export abstract class AutoUpdateService  {
    public status: Observable<UpdateStatus>;
    public updateInfo: UpdateInfo = null;

    public abstract disable();
    public abstract set autoInstallOnAppQuit(value: boolean);
    public abstract setFeedUrl(value: string);
    public abstract quitAndInstall();
    public abstract checkForUpdates();

}
