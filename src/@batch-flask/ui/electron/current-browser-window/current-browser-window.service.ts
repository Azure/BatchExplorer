import { Injectable, OnDestroy } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/electron";
import { BrowserWindow } from "electron";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({providedIn: "root"})
export class CurrentBrowserWindow implements OnDestroy {
    /**
     * Observable that emit if the window is in full screen mode
     */
    public fullScreen: Observable<boolean>;

    private _fullScreen = new BehaviorSubject(false);
    private _electronWindow: BrowserWindow;

    constructor(remote: ElectronRemote) {
        this._electronWindow = remote.getCurrentWindow();

        this._fullScreen.next(this._electronWindow.isFullScreen());
        this.fullScreen = this._fullScreen.asObservable();

        this._electronWindow.on("enter-full-screen", this._enterFullscreen);
        this._electronWindow.on("leave-full-screen", this._leaveFullscreen);
    }

    public ngOnDestroy() {
        this._electronWindow.removeListener("enter-full-screen", this._enterFullscreen);
        this._electronWindow.removeListener("leave-full-screen", this._leaveFullscreen);
    }

    @autobind()
    private _enterFullscreen() {
        this._fullScreen.next(true);
    }

    @autobind()
    private _leaveFullscreen() {
        this._fullScreen.next(false);
    }
}
