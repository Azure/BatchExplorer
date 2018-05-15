import { ElectronRemote } from "@batch-flask/ui";
import { AuthenticationWindow } from "client/core/aad/authentication";
import { SplashScreen } from "client/splash-screen";
import { MockAuthenticationWindow, MockBrowserWindow, MockSplashScreen } from "../windows";
import { NgModule } from "@angular/core";

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

@NgModule({
    providers: [
        { provide: ElectronRemote, useClass: MockElectronRemote },
    ],
})
export class ElectronTestingModule {

}
