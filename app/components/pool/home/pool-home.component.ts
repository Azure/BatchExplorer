import { Component } from "@angular/core";

import { SidebarManager } from "../../base/sidebar";
import { PoolCreateBasicDialogComponent } from "../action";

@Component({
    selector: "bex-pool-home",
    template: require("./pool-home.html"),
})
export class PoolHomeComponent {

    constructor(private sidebarManager: SidebarManager) {
    }

    public addPool() {
        this.sidebarManager.open("add-basic-pool", PoolCreateBasicDialogComponent);
    }
}
