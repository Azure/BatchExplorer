import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BaseModule } from "@batch-flask/ui";
import { LocalTemplateExplorerComponent } from "./local-template-explorer.component";
import { LocalTemplateSourceFormComponent } from "./local-template-source-form";

const publicComponents = [LocalTemplateExplorerComponent];
const privateComponents = [LocalTemplateSourceFormComponent];

@NgModule({
    imports: [CommonModule, BaseModule, FormsModule, ReactiveFormsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [LocalTemplateSourceFormComponent],
})
export class LocalTemplateExplorerModule {
}
