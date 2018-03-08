import { BehaviorSubject, Subscription } from "rxjs";

import { SplashScreen } from "client/splash-screen";
import { BatchLabsApplication } from "./batchlabs-application";

interface InitializerTask {
    message: string;
    importance: number;
}

export class BatchLabsInitializer {
    public splashScreen: SplashScreen;

    private _sub: Subscription;
    private _tasks = new BehaviorSubject<Map<string, InitializerTask>>(new Map());
    constructor(batchLabsApplication: BatchLabsApplication) {
        this.splashScreen = new SplashScreen(batchLabsApplication);
        this._sub = this._tasks.subscribe(() => {
            this._updateSplashScreen();
        });
    }

    public init() {
        this.splashScreen.create();
    }

    public show() {
        this.splashScreen.show();
    }

    public hide() {
        this.splashScreen.hide();
    }

    public get isLogin() {
        return this._tasks.value.has("login");
    }

    public setTaskStatus(key: string, message: string, importance = 1) {
        const tasks = this._tasks.value;
        tasks.set(key, { message, importance });
        this._tasks.next(tasks);
    }

    public completeTask(key: string) {
        const tasks = this._tasks.value;
        tasks.delete(key);
        this._tasks.next(tasks);
    }

    public completeLogin() {
        this.completeTask("login");
    }

    public setLoginStatus(status: string) {
        this.setTaskStatus("login", status, 10);
    }

    public complete() {
        this._sub.unsubscribe();
        this.splashScreen.destroy();
    }

    private _updateSplashScreen() {
        const message = this._getMostImportantTask();
        if (message) {
            this.splashScreen.show();
            this.splashScreen.updateMessage(message);
        } else {
            this.splashScreen.destroy();
        }
    }

    private _getMostImportantTask() {
        let bestMessage = null;
        let bestImportance = -1;
        for (const { message, importance } of this._tasks.value.values()) {
            if (importance > bestImportance) {
                bestMessage = message;
                bestImportance = importance;
            }
        }
        return bestMessage;
    }
}
