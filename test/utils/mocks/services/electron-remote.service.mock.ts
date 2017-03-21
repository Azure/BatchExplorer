import { Subject } from "rxjs";

import { ElectronRemote } from "app/services";
import { BatchClientProxyFactory } from "client/api";
import { SplashScreen } from "client/splash-screen";

export class MockElectronRemote extends ElectronRemote {
    public currentWindow: MockBrowserWindow;
    public splashScreen: MockSplashScreen;

    constructor() {
        super();
        this.currentWindow = new MockBrowserWindow();
        this.splashScreen = new MockSplashScreen();
    }

    public getCurrentWindow(): Electron.BrowserWindow {
        return this.currentWindow as any;
    }

    public getSplashScreen(): SplashScreen {
        return this.splashScreen as any;
    }

    public getBatchClientFactory(): BatchClientProxyFactory {
        return null;
    }

}

export class MockBrowserWindow {
    public destroy: jasmine.Spy;
    public loadURL: jasmine.Spy;
    public on: jasmine.Spy;
    public webContents: { on: jasmine.Spy, notify: Function };

    private _isVisible = false;
    private _events: { [key: string]: Subject<any> } = {};

    constructor() {
        this.destroy = jasmine.createSpy("destroy");
        this.loadURL = jasmine.createSpy("loadURL");
        this.on = jasmine.createSpy("on").and.callFake((event: string, callback: Function) => {
            if (!(event in this._events)) {
                this._events[event] = new Subject();
            }
            this._events[event].subscribe((data) => {
                callback(...data.args);
            });
        });
        this.webContents = {
            on: jasmine.createSpy("webcontents.on").and.callFake((event: string, callback: Function) => {
                this.on(`webcontents.${event}`, callback);
            }),
            notify: (event: string, data: any) => {
                this.notify(`webcontents.${event}`, data);
            },
        };
    }

    public isVisible() {
        return this._isVisible;
    }

    public show() {
        this._isVisible = true;
    }

    public hide() {
        this._isVisible = false;
    }

    public notify(event: string, args: any[]) {
        if (event in this._events) {
            this._events[event].next({ args: args });
        }
    }
}

export class MockSplashScreen {
    public show: jasmine.Spy;
    public hide: jasmine.Spy;
    public destroy: jasmine.Spy;
    constructor() {
        this.show = jasmine.createSpy("show");
        this.hide = jasmine.createSpy("hide");
        this.destroy = jasmine.createSpy("destroy");
    }
}
