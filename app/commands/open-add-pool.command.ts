import { Injectable } from "@angular/core";

import { SidebarManager } from "app/components/base/sidebar";
import { PoolCreateBasicDialogComponent } from "app/components/pool/action";
import { CommandBase } from "./core";

@Injectable()
export class OpenAddPoolCommand extends CommandBase {
    public static id = "open-add-pool";

    constructor(private sidebarManager: SidebarManager) {
        super();
    }

    public execute() {
        this.sidebarManager.open("add-basic-pool", PoolCreateBasicDialogComponent);
    }
}
