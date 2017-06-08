import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { StorageAccountPickerComponent } from "app/components/account/base/storage-account-picker";
import { PoolDetailsModule } from "app/components/pool/details";
import { AccountCreateDialogComponent } from "./action/add/account-create-dialog.component";
import { DeleteAccountDialogComponent } from "./action/delete/delete-account-dialog.component";
import { AccountBrowseModule } from "./browse";
import { AccountDefaultComponent, AccountDetailsComponent } from "./details";
import { AccountQuotasCardComponent } from "./details/account-quotas-card";
import { StorageAccountCardComponent } from "./details/storage-account-card";
import { AccountHomeComponent } from "./home";

const components = [
    AccountCreateDialogComponent, AccountDefaultComponent, AccountDetailsComponent,
    AccountHomeComponent, DeleteAccountDialogComponent, StorageAccountCardComponent,
    EditStorageAccountFormComponent, StorageAccountPickerComponent, AccountQuotasCardComponent,
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
        EditStorageAccountFormComponent,
    ],
})
export class AccountModule {
}
