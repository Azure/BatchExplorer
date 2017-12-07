import { Subject } from "rxjs";

import { ElectronRemote } from "app/services";
import { AuthenticationWindow } from "client/core/aad/authentication";
import { SplashScreen } from "client/splash-screen";

export class MockElectronRemote extends ElectronRemote {
    public authenticationWindow: MockAuthenticationWindow;
    public currentWindow: MockBrowserWindow;
    public splashScreen: MockSplashScreen;

    constructor() {
        super();
        this.currentWindow = new MockBrowserWindow();
        this.splashScreen = new MockSplashScreen();
        this.authenticationWindow = new MockAuthenticationWindow();
    }

    public getCurrentWindow(): Electron.BrowserWindow {
        return this.currentWindow as any;
    }

    public getAuthenticationWindow(): AuthenticationWindow {
        return this.authenticationWindow as any;
    }

    public getSplashScreen(): SplashScreen {
        return this.splashScreen as any;
    }
}

export class MockBrowserWindow {
    public destroy: jasmine.Spy;
    public loadURL: jasmine.Spy;
    public on: jasmine.Spy;
    public webContents: { on: jasmine.Spy, notify: (...args) => void };

    private _isVisible = false;
    private _events: { [key: string]: Subject<any> } = {};

    constructor() {
        this.destroy = jasmine.createSpy("destroy");
        this.loadURL = jasmine.createSpy("loadURL");
        this.on = jasmine.createSpy("on").and.callFake((event: string, callback: (...args) => void) => {
            if (!(event in this._events)) {
                this._events[event] = new Subject();
            }
            this._events[event].subscribe((data) => {
                callback(...data.args);
            });
        });
        this.webContents = {
            on: jasmine.createSpy("webcontents.on").and.callFake((event: string, callback: (...args) => void) => {
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

export class MockUniqueWindow {
    public create: jasmine.Spy;
    public show: jasmine.Spy;
    public hide: jasmine.Spy;
    public destroy: jasmine.Spy;
    private _visible: boolean = false;

    constructor() {
        this.create = jasmine.createSpy("create");
        this.show = jasmine.createSpy("show").and.callFake(() => this._visible = true);
        this.hide = jasmine.createSpy("hide").and.callFake(() => this._visible = false);
        this.destroy = jasmine.createSpy("destroy");
    }

    public isVisible() {
        return this._visible;
    }
}

export class MockSplashScreen extends MockUniqueWindow {
}

export class MockAuthenticationWindow extends MockUniqueWindow {
    public loadURL: jasmine.Spy;
    private _onRedirectCallbacks = [];
    private _onCloseCallbacks = [];

    constructor() {
        super();

        this.loadURL = jasmine.createSpy("loadURL");
        this.destroy = this.destroy.and.callFake(() => {
            this._onRedirectCallbacks = [];
            this._onCloseCallbacks = [];
        });
    }

    public onRedirect(callback) {
        this._onRedirectCallbacks.push(callback);
    }

    public onClose(callback) {
        this._onCloseCallbacks.push(callback);
    }

    public notifyRedirect(newUrl) {
        for (let callback of this._onRedirectCallbacks) {
            callback(newUrl);
        }
    }

    public notifyClose() {
        for (let callback of this._onCloseCallbacks) {
            callback();
        }
    }
}
