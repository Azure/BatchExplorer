import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ButtonsModule, PropertyListModule } from "@batch-flask/ui";
import { ResourceFilesPropertiesComponent } from "./resource-files-properties.component";

const publicComponents = [ResourceFilesPropertiesComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, PropertyListModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ResourceFilesPropertiesModule {
}
