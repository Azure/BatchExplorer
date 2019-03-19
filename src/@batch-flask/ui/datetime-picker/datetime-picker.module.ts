import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material";
import { I18nUIModule } from "../i18n";
import { DatetimePickerComponent } from "./datetime-picker.component";

const publicComponents = [DatetimePickerComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class DatetimePickerModule {
}
