import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { AccountCreateDialogComponent } from "app/components/account/action/add/account-create-dialog.component";
import { DeleteAccountDialogComponent } from "app/components/account/action/delete/delete-account-dialog.component";
import { AccountBrowseModule } from "app/components/account/browse";
import { AccountDefaultComponent, AccountDetailsComponent } from "app/components/account/details";
import { AccountHomeComponent } from "app/components/account/home";
import { PoolDetailsModule } from "app/components/pool/details";

const components = [
    AccountCreateDialogComponent, AccountDefaultComponent, AccountDetailsComponent,
    AccountHomeComponent, DeleteAccountDialogComponent,
];

const modules = [
    AccountBrowseModule, PoolDetailsModule, ...commonModules,
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
