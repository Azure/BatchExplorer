import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ElectronRemote } from "@batch-flask/ui";
import { Observable, Subscription } from "rxjs";

import { NavigatorService } from "app/services";
import { IpcEvent } from "common/constants";
import "./online-status.scss";

@Component({
    selector: "bl-online-status",
    templateUrl: "online-status.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineStatusComponent implements OnInit, OnDestroy {
    public disconnectedMessage: string;
    public nodeOnline: boolean;
    public browserOnline: boolean;
    public offline: boolean = false;
    private _sub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private remote: ElectronRemote,
        private navigatorService: NavigatorService) {
    }

    public ngOnInit() {
        this._sub = Observable.timer(0, 30000).concatMap(() => {
            return Observable.fromPromise(this.updateOnlineStatus());
        }).subscribe();
    }
    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public async updateOnlineStatus() {
        this.browserOnline = this._checkBrowserOnline();
        this.nodeOnline = await this._checkNodeOnline();
        this.offline = !this.browserOnline || !this.nodeOnline;
        this._updateMessage();
        this.changeDetector.markForCheck();
    }

    private _updateMessage() {
        if (this.offline) {
            let message = "Seems like the internet connection is broken.";
            if (this.browserOnline) {
                message += " This might be an issue with your proxy settings";
            }
            this.disconnectedMessage = message;
        } else {
            this.disconnectedMessage = "";
        }
    }

    private _checkBrowserOnline(): boolean {
        return this.navigatorService.onLine;
    }

    private async _checkNodeOnline(): Promise<boolean> {
        try {
            await this.remote.send(IpcEvent.fetch, { url: "https://bing.com" });
            return true;
        } catch (e) {
            return false;
        }
    }
}
