import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { StorageAccountPickerComponent } from "app/components/account/base/storage-account-picker";
import { PoolBaseModule } from "app/components/pool/base";
import { DeleteAccountDialogComponent } from "./action/delete/delete-account-dialog.component";
import { AccountBrowseModule } from "./browse";
import { AccountDefaultComponent, AccountDetailsComponent } from "./details";
import { AccountQuotasCardComponent } from "./details/account-quotas-card";
import { ProgramaticUsageModule } from "./details/programatic-usage";
import { MonitorChartComponent } from "./details/monitor-chart";
import { StorageAccountCardComponent } from "./details/storage-account-card";
import { AccountHomeComponent } from "./home";

const components = [
    AccountDefaultComponent, AccountDetailsComponent,
    AccountHomeComponent, DeleteAccountDialogComponent, StorageAccountCardComponent,
    EditStorageAccountFormComponent, StorageAccountPickerComponent, AccountQuotasCardComponent,
    MonitorChartComponent,
];

const modules = [
    AccountBrowseModule, PoolBaseModule, ProgramaticUsageModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        DeleteAccountDialogComponent,
        EditStorageAccountFormComponent,
    ],
})
export class AccountModule {
}
