import { Injectable } from "@angular/core";

import { CommandBase } from "./core";
import { SidebarManager } from "app/components/base/sidebar";
import { PoolCreateBasicDialogComponent } from "app/components/pool/action";

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
