import { NgModule } from "@angular/core";
import { ElectronRemote } from "@batch-flask/electron/remote.service";
import { ElectronShell } from "@batch-flask/electron/shell.service";
import { AuthenticationWindow } from "client/core/aad/authentication";
import { SplashScreen } from "client/splash-screen";
import { MockAuthenticationWindow, MockBrowserWindow, MockSplashScreen } from "test/utils/mocks/windows";

export class MockElectronRemote extends ElectronRemote {
    public authenticationWindow: MockAuthenticationWindow;
    public currentWindow: MockBrowserWindow;
    public splashScreen: MockSplashScreen;

    constructor() {
        super(null);
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

export class MockElectronShell {
    public openItem: jasmine.Spy;
    public openExternal: jasmine.Spy;
    public showItemInFolder: jasmine.Spy;

    constructor() {
        this.openItem = jasmine.createSpy("openItem");
        this.openExternal = jasmine.createSpy("openExternal");
        this.showItemInFolder = jasmine.createSpy("showItemInFolder");
    }
}

@NgModule({
    providers: [
        { provide: ElectronRemote, useClass: MockElectronRemote },
        { provide: ElectronShell, useClass: MockElectronShell },
    ],
})
export class ElectronTestingModule {

}
