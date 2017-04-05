import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { PoolAdvancedFilterComponent } from "app/components/pool/browse/filter";
import { PoolListComponent } from "app/components/pool/browse/pool-list.component";
import { PoolDetailsModule } from "app/components/pool/details";
import { PoolGraphsModule } from "app/components/pool/graphs";
import { PoolHomeComponent } from "app/components/pool/home/pool-home.component";
import { StartTaskModule } from "app/components/pool/start-task";

import {
    DeletePoolDialogComponent,
    OsOfferTileComponent,
    PoolCreateBasicDialogComponent,
    PoolOsPickerComponent,
    PoolResizeDialogComponent,
    VmSizePickerComponent,
} from "app/components/pool/action";

const components = [
    DeletePoolDialogComponent, PoolAdvancedFilterComponent, PoolCreateBasicDialogComponent,
    PoolHomeComponent, PoolListComponent, PoolOsPickerComponent, VmSizePickerComponent,
    PoolResizeDialogComponent, OsOfferTileComponent,
];

const modules = [
    PoolDetailsModule, PoolGraphsModule, StartTaskModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        DeletePoolDialogComponent,
        PoolCreateBasicDialogComponent,
        PoolResizeDialogComponent,
    ],
})
export class PoolModule {
}
