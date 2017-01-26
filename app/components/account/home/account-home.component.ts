import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { SidebarManager } from "../../base/sidebar";
import AccountCreateDialogComponent from "../add/account-create-dialog.component";

enum ListType {
    Favourite,
    All,
};

@Component({
    selector: "bex-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent {
    public ListType = ListType;

    public showType: ListType = ListType.All;

    constructor(private formBuilder: FormBuilder, private sidebarManager: SidebarManager) {
    }

    public addAccount() {
        const ref = this.sidebarManager.open("add-account", AccountCreateDialogComponent);
        ref.afterCompletition.subscribe(() => {
            //
        });
    }
}
