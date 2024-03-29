import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from "@angular/material/menu";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BaseModule, FormModule, I18nUIModule, SelectModule } from "@batch-flask/ui";
import { DataDiskPickerComponent, OsOfferTileComponent, PoolOsPickerComponent, SigImagePickerComponent } from ".";
import { ContainerConfigurationPickerModule } from "../container-configuration-picker";
import { OSImagePickerComponent } from "./os-image-picker";

const publicComponents = [
    SigImagePickerComponent,
    PoolOsPickerComponent,
    DataDiskPickerComponent,
];
const privateComponents = [
    OsOfferTileComponent,
    OSImagePickerComponent,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ContainerConfigurationPickerModule,
        I18nUIModule,
        SelectModule,
        FormModule,
        BaseModule,
        MatMenuModule,
        MatTooltipModule,
        MatTabsModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class PoolOSPickerModule {
}
