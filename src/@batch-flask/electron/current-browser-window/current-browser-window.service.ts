import { Injectable, OnDestroy } from "@angular/core";
import { BrowserWindow } from "electron";
import { BehaviorSubject, Observable, Subject, fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ElectronRemote } from "../remote.service";
import { willUnload } from "../utils";

@Injectable()
export class CurrentBrowserWindow implements OnDestroy {
    /**
     * Observable that emit if the window is in full screen mode
     */
    public fullScreen: Observable<boolean>;

    private _fullScreen = new BehaviorSubject(false);
    private _electronWindow: BrowserWindow;
    private _destroy = new Subject();

    constructor(remote: ElectronRemote) {
        this._electronWindow = remote.getCurrentWindow();

        this._fullScreen.next(this._electronWindow.isFullScreen());
        this.fullScreen = this._fullScreen.asObservable();
        fromEvent(this._electronWindow, "enter-full-screen").pipe(
            takeUntil(willUnload),
            takeUntil(this._destroy),
        ).subscribe(() => {
            this._fullScreen.next(true);
        });

        fromEvent(this._electronWindow, "leave-full-screen").pipe(
            takeUntil(willUnload),
            takeUntil(this._destroy),
        ).subscribe(() => {
            this._fullScreen.next(false);
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
