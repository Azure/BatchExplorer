import { NgModule } from "@angular/core";
import { ElectronRemote } from "@batch-flask/electron/remote.service";
import { ElectronShell } from "@batch-flask/electron/shell.service";
import { MockAuthenticationWindow, MockBrowserWindow, MockSplashScreen } from "test/utils/mocks/windows";

export class MockElectronDialog {
    public showSaveDialog: jasmine.Spy;

    constructor() {
        this.showSaveDialog =
            jasmine.createSpy("dialog.showSaveDialog").and.callFake(
                () => new Promise(
                    resolve => resolve({ filePath: "/some/local/path/foo.ts" }),
                ));
    }
}

export class MockElectronRemote {
    public authenticationWindow: MockAuthenticationWindow;
    public currentWindow: MockBrowserWindow;
    public splashScreen: MockSplashScreen;
    public dialog: MockElectronDialog;

    constructor() {
        this.dialog = new MockElectronDialog();
        this.currentWindow = new MockBrowserWindow();
        this.splashScreen = new MockSplashScreen();
        this.authenticationWindow = new MockAuthenticationWindow();
    }

    public getCurrentWindow(): Electron.BrowserWindow {
        return this.currentWindow as any;
    }

    public getAuthenticationWindow() {
        return this.authenticationWindow;
    }

    public getSplashScreen(): any {
        return this.splashScreen;
    }

    public asProvider() {
        return { provide: ElectronRemote, useValue: this };
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

    public asProvider() {
        return { provide: ElectronShell, useValue: this };
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
