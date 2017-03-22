import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { DeleteAccountDialogComponent } from "app/components/account/action/delete-account-dialog.component";
import AccountCreateDialogComponent from "app/components/account/add/account-create-dialog.component";
import { AccountBrowseModule } from "app/components/account/browse";
import { AccountDefaultComponent, AccountDetailsComponent } from "app/components/account/details";
import { AccountHomeComponent } from "app/components/account/home";

const components = [
    AccountCreateDialogComponent, AccountDefaultComponent, AccountDetailsComponent,
    AccountHomeComponent, DeleteAccountDialogComponent,
];

const modules = [
    AccountBrowseModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        AccountCreateDialogComponent,
        DeleteAccountDialogComponent,
    ],
})
export class AccountModule {
}
