import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FormModule } from "@batch-flask/ui/form";
import { I18nUIModule } from "@batch-flask/ui/i18n";
import { SelectModule } from "@batch-flask/ui/select";
import { DurationPickerComponent } from "./duration-picker.component";

const publicComponents = [
    DurationPickerComponent,
];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, FormsModule, SelectModule, FormModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class DurationPickerModule {
}
