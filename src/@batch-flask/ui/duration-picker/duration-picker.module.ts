import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { FormModule } from "@batch-flask/ui/form";
import { SelectModule } from "@batch-flask/ui/select";
import { DurationPickerComponent } from "./duration-picker.component";

const publicComponents = [
    DurationPickerComponent,
];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, FormsModule, SelectModule, FormModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class DurationPickerModule {
}
