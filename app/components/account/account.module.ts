import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { AutoStorageAccountPickerComponent } from "app/components/account/base/auto-storage-account-picker";
import { PoolBaseModule } from "app/components/pool/base";
import { BatchAccountCommands } from "./action";
import { BatchAccountCreateComponent } from "./action/add";
import { DeleteAccountDialogComponent } from "./action/delete/delete-account-dialog.component";
import { AccountBrowseModule } from "./browse";
import { AccountDefaultComponent, AccountDetailsComponent, GettingStartedCardComponent } from "./details";
import { AccountQuotasCardComponent } from "./details/account-quotas-card";
import { ProgramaticUsageModule } from "./details/programatic-usage";
import { StorageAccountCardComponent } from "./details/storage-account-card";
import { AccountHomeComponent } from "./home";
import { AccountMonitoringModule } from "./monitoring";

const components = [
    AccountDefaultComponent, AccountDetailsComponent, AccountHomeComponent,
    BatchAccountCreateComponent, DeleteAccountDialogComponent, StorageAccountCardComponent,
    EditStorageAccountFormComponent, AutoStorageAccountPickerComponent, AccountQuotasCardComponent,
    GettingStartedCardComponent,
];

const modules = [
    AccountBrowseModule, AccountMonitoringModule, PoolBaseModule, ProgramaticUsageModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        BatchAccountCreateComponent,
        DeleteAccountDialogComponent,
        EditStorageAccountFormComponent,
    ],
    providers: [
        BatchAccountCommands,
    ],
})
export class AccountModule {
}
