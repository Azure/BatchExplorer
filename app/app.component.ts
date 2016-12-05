import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MdSidenav } from "@angular/material";
import { Observable } from "rxjs";

import AccountCreateDialogComponent from "./components/account/add/account-create-dialog.component";
import { SidebarContentComponent, SidebarManager } from "./components/base/sidebar";
import { AccountService, CommandService, SettingsService } from "app/services";

@Component({
    selector: "bex-app",
    templateUrl: "app.layout.html",
})
export class AppComponent implements AfterViewInit {
    public hasAccount: Observable<boolean>;

    @ViewChild("rightSidebar")
    private sidebar: MdSidenav;

    @ViewChild("sidebarContent")
    private sidebarContent: SidebarContentComponent;

    constructor(
        private sidebarManager: SidebarManager,
        private settingsService: SettingsService,
        private commandService: CommandService,
        private accountService: AccountService) {
        this.hasAccount = accountService.currentAccount.map((x) => { return Boolean(x); });
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
}
