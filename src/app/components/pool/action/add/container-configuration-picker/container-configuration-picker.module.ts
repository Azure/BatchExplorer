import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule, SelectModule } from "@batch-flask/ui";
import { ContainerConfigurationPickerComponent } from "./container-configuration-picker.component";
import { ContainerImagesPickerComponent } from "./images-picker";
import { ContainerRegistryPickerComponent } from "./registry-picker";

const publicComponents = [
    ContainerConfigurationPickerComponent,
];
const privateComponents = [
    ContainerImagesPickerComponent,
    ContainerRegistryPickerComponent,
];

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, FormModule, SelectModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ContainerConfigurationPickerModule {
}
