import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { EditStorageAccountFormComponent } from "app/components/account/action/edit-storage-account";
import { AutoStorageAccountPickerComponent } from "app/components/account/base/auto-storage-account-picker";
import { PoolBaseModule } from "app/components/pool/base";
import { PoolGraphsModule } from "../pool/graphs";
import { AddLocalBatchAccountComponent } from "./action/add";
import { BatchAccountCreateComponent } from "./action/create";
import { DeleteAccountDialogComponent } from "./action/delete/delete-account-dialog.component";
import { AccountBrowseModule } from "./browse";
import { AccountDefaultComponent, AccountDetailsComponent, GettingStartedCardComponent } from "./details";
import { AccountCostCardComponent } from "./details/account-cost-card";
import { AccountMonitoringSectionComponent } from "./details/account-monitoring-section";
import { AccountQuotasCardComponent } from "./details/account-quotas-card";
import { AccountSummaryCardComponent } from "./details/account-summary-card";
import { ProgramaticUsageModule } from "./details/programatic-usage";
import { StorageAccountCardComponent } from "./details/storage-account-card";
import { AccountHomeComponent } from "./home";
import { AccountMonitoringModule } from "./monitoring";

const components = [
    AccountDefaultComponent, AccountDetailsComponent, AccountHomeComponent,
    BatchAccountCreateComponent, DeleteAccountDialogComponent, StorageAccountCardComponent,
    EditStorageAccountFormComponent, AutoStorageAccountPickerComponent, AccountQuotasCardComponent,
    GettingStartedCardComponent, AddLocalBatchAccountComponent, AccountCostCardComponent,
    AccountSummaryCardComponent, AccountMonitoringSectionComponent,
];

const modules = [
    ...commonModules,
    AccountBrowseModule,
    AccountMonitoringModule,
    PoolBaseModule,
    ProgramaticUsageModule,
    PoolGraphsModule,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        AddLocalBatchAccountComponent,
        BatchAccountCreateComponent,
        DeleteAccountDialogComponent,
        EditStorageAccountFormComponent,
    ],
})
export class AccountModule {
}
