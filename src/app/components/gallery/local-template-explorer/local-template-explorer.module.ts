import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BaseModule } from "@batch-flask/ui";
import { LocalTemplateDropZoneComponent } from "./local-template-drop-zone";
import { LocalTemplateExplorerComponent } from "./local-template-explorer.component";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

const publicComponents = [
    LocalTemplateExplorerComponent,
    LocalTemplateDropZoneComponent,
];
const privateComponents = [LocalTemplateSourceFormComponent];

@NgModule({
    imports: [CommonModule, BaseModule, FormsModule, ReactiveFormsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [LocalTemplateSourceFormComponent],
})
export class LocalTemplateExplorerModule {
}
