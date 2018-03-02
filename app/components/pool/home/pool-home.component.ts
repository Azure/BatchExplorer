import { Component } from "@angular/core";
import { autobind } from "@bl-common/core";

import { SidebarManager } from "@bl-common/ui/sidebar";
import { PoolCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bl-pool-home",
    templateUrl: "pool-home.html",
})
export class PoolHomeComponent {

    public static breadcrumb() {
        return { name: "Pools" };
    }
    constructor(
        private sidebarManager: SidebarManager) {
    }

    @autobind()
    public addPool() {
        this.sidebarManager.open("add-pool", PoolCreateBasicDialogComponent);
    }
}
