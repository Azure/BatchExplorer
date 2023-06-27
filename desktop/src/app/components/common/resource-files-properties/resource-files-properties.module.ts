import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ButtonsModule, I18nUIModule, PropertyListModule } from "@batch-flask/ui";
import { ResourceFilesPropertiesComponent } from "./resource-files-properties.component";

const publicComponents = [ResourceFilesPropertiesComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, PropertyListModule, ButtonsModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ResourceFilesPropertiesModule {
}
