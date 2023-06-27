import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import {
    AppLicensePickerComponent,
    AutoScaleFormulaPickerModule,
    DeallocationOptionPickerComponent,
    DeletePoolDialogComponent,
    LicenseEulaDialogComponent,
    PoolCreateBasicDialogComponent,
    PoolOSPickerModule,
    PoolResizeDialogComponent,
    PoolScalePickerComponent,
    VmSizePickerComponent,
    VmSizePickerFilterComponent,
} from "app/components/pool/action";
import { PoolBaseModule } from "app/components/pool/base";
import { PoolAdvancedFilterComponent } from "app/components/pool/browse/filter";
import { PoolListComponent } from "app/components/pool/browse/pool-list.component";
import { PoolDetailsModule } from "app/components/pool/details";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { PoolHomeComponent } from "app/components/pool/home/pool-home.component";
import { StartTaskModule } from "app/components/pool/start-task";
import { TaskBaseModule } from "app/components/task/base";
import { EditPoolModule } from "./action/edit/edit-pool.module";
import { NetworkConfigurationModule } from "./network-configuration";
import { PoolRoutingModule } from "./pool-routing.module";
import { UserAccountsPickerModule } from "./user-accounts-picker";

const components = [
    AppLicensePickerComponent,
    DeallocationOptionPickerComponent,
    DeletePoolDialogComponent,
    LicenseEulaDialogComponent,
    PoolAdvancedFilterComponent,
    PoolCreateBasicDialogComponent,
    PoolHomeComponent,
    PoolListComponent,
    PoolScalePickerComponent,
    VmSizePickerComponent,
    VmSizePickerFilterComponent,
    PoolResizeDialogComponent,
];

const modules = [
    TaskBaseModule,
    PoolOSPickerModule,
    ...commonModules,
];

const publicModules = [
    StartTaskModule,
    UserAccountsPickerModule,
    AutoScaleFormulaPickerModule,
    PoolBaseModule,
    PoolDetailsModule,
    NetworkConfigurationModule,
    PoolGraphsModule,
    PoolRoutingModule,
    EditPoolModule,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...publicModules, ...components],
    imports: [...modules, ...publicModules],
    entryComponents: [
        DeletePoolDialogComponent,
        LicenseEulaDialogComponent,
        PoolCreateBasicDialogComponent,
        PoolResizeDialogComponent,
    ],
})
export class PoolModule {
}
