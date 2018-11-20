import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { SelectOptionComponent } from "./option";
import { OptionTemplateDirective } from "./option-template.directive";
import { SelectDropdownComponent } from "./select-dropdown";
import { SelectComponent } from "./select.component";

const publicComponents = [SelectComponent, SelectOptionComponent, OptionTemplateDirective];
const privateComponents = [SelectDropdownComponent];

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [SelectDropdownComponent],
})
export class SelectModule {
}
