import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { PoolAdvancedFilterComponent } from "app/components/pool/browse/filter";
import { PoolListComponent } from "app/components/pool/browse/pool-list.component";
import { PoolDetailsModule } from "app/components/pool/details";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { PoolHomeComponent } from "app/components/pool/home/pool-home.component";
import { StartTaskModule } from "app/components/pool/start-task";
import { TaskBaseModule } from "app/components/task/base";
import { UserAccountModule } from "./user-account";

import {
    AppLicensePickerComponent,
    AutoscaleFormulaPickerComponent,
    DeletePoolDialogComponent,
    LicenseEulaDialogComponent,
    OsOfferTileComponent,
    PoolCreateBasicDialogComponent,
    PoolOsPickerComponent,
    PoolResizeDialogComponent,
    PoolScalePickerComponent,
    VmSizePickerComponent,
} from "app/components/pool/action";

const components = [
    AppLicensePickerComponent, AutoscaleFormulaPickerComponent, DeletePoolDialogComponent,
    LicenseEulaDialogComponent, OsOfferTileComponent, PoolAdvancedFilterComponent, PoolCreateBasicDialogComponent,
    PoolHomeComponent, PoolListComponent, PoolOsPickerComponent, PoolScalePickerComponent, VmSizePickerComponent,
    PoolResizeDialogComponent,
];

const modules = [
    PoolDetailsModule, PoolGraphsModule, StartTaskModule, UserAccountModule, TaskBaseModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        DeletePoolDialogComponent,
        LicenseEulaDialogComponent,
        PoolCreateBasicDialogComponent,
        PoolResizeDialogComponent,
    ],
})
export class PoolModule {
}
