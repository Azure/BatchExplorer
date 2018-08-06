import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, from, timer } from "rxjs";

import { NavigatorService } from "app/services";
import { concatMap } from "rxjs/operators";
import "./online-status.scss";

@Component({
    selector: "bl-online-status",
    templateUrl: "online-status.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineStatusComponent implements OnInit, OnDestroy {
    public disconnectedMessage: string;
    public browserOnline: boolean;
    public offline: boolean = false;
    private _sub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private navigatorService: NavigatorService) {
    }

    public ngOnInit() {
        this._sub = timer(0, 30000).pipe(
            concatMap(() => {
                return from(this.updateOnlineStatus());
            }),
        ).subscribe();
    }
    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public async updateOnlineStatus() {
        this.browserOnline = this._checkBrowserOnline();
        this.offline = !this.browserOnline;
        this._updateMessage();
        this.changeDetector.markForCheck();
    }

    private _updateMessage() {
        if (this.offline) {
            const message = "Seems like the internet connection is broken.";
            this.disconnectedMessage = message;
        } else {
            this.disconnectedMessage = "";
        }
    }

    private _checkBrowserOnline(): boolean {
        return this.navigatorService.onLine;
    }
}
