import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MdSidenav } from "@angular/material";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountService, AdalService, CommandService, SettingsService } from "app/services";
import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";

const adalConfig = {
    tenant: "microsoft.onmicrosoft.com",
    clientId: "9d77ff61-52a4-4e96-a128-44f67265affd",
};

@Component({
    selector: "bex-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit {
    public hasAccount: Observable<boolean>;
    public isAppReady = new BehaviorSubject<boolean>(false);

    @ViewChild("rightSidebar")
    private sidebar: MdSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        private sidebarManager: SidebarManager,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private adalService: AdalService,
        private accountService: AccountService) {
        this.settingsService.init();
        this.commandService.init();
        this.adalService.init(adalConfig);

        this.hasAccount = accountService.currentAccount.map((x) => { return Boolean(x); });

        Observable
            .combineLatest(accountService.accountLoaded, settingsService.hasSettingsLoaded)
            .subscribe((loadedArray) => {
                this.isAppReady.next(loadedArray[0] && loadedArray[1]);
            });
    }

    public ngAfterViewInit() {
        // Give the reference to the sidebar to the sidebar manager
        this.sidebarManager.sidebar = this.sidebar;
        this.sidebarManager.sidebarContent = this.sidebarContent;
    }

    public open() {
        this.sidebar.open();
    }

    public addAccount() {
        this.sidebarManager.open("add-account", AccountCreateDialogComponent);
    }

    public login() {
        this.adalService.login();
    }
}
