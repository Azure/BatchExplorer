import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { PoolBaseModule } from "app/components/pool/base";
import { PoolAdvancedFilterComponent } from "app/components/pool/browse/filter";
import { PoolListComponent } from "app/components/pool/browse/pool-list.component";
import { PoolDetailsModule } from "app/components/pool/details";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { PoolHomeComponent } from "app/components/pool/home/pool-home.component";
import { StartTaskModule } from "app/components/pool/start-task";
import { TaskBaseModule } from "app/components/task/base";
import { NetworkConfigurationModule } from "./network-configuration";
import { UserAccountModule } from "./user-account";

import {
    AppLicensePickerComponent,
    AutoScaleFormulaPickerModule,
    CertificatePickerComponent,
    ContaienrImagesPickerComponent,
    ContainerConfigurationPickerComponent,
    ContainerRegistryPickerComponent,
    CustomImagePickerComponent,
    DeallocationOptionPickerComponent,
    DeletePoolDialogComponent,
    LicenseEulaDialogComponent,
    OsOfferTileComponent,
    PoolCreateBasicDialogComponent,
    PoolOsPickerComponent,
    PoolResizeDialogComponent,
    PoolScalePickerComponent,
    VmSizePickerComponent,
    VmSizePickerFilterComponent,
} from "app/components/pool/action";
import { EditPoolModule } from "./action/edit/edit-pool.module";
import { PoolRoutingModule } from "./pool-routing.module";

const components = [
    AppLicensePickerComponent, CertificatePickerComponent,
    ContainerConfigurationPickerComponent, ContaienrImagesPickerComponent, ContainerRegistryPickerComponent,
    DeallocationOptionPickerComponent, DeletePoolDialogComponent, LicenseEulaDialogComponent, OsOfferTileComponent,
    PoolAdvancedFilterComponent, PoolCreateBasicDialogComponent, PoolHomeComponent, PoolListComponent,
    PoolOsPickerComponent, PoolScalePickerComponent, VmSizePickerComponent, VmSizePickerFilterComponent,
    PoolResizeDialogComponent, CustomImagePickerComponent,
];

const modules = [
    TaskBaseModule,
    ...commonModules,
];

const publicModules = [
    StartTaskModule,
    UserAccountModule,
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
