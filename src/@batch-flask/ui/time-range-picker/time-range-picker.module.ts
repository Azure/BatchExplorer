import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "../buttons";
import { CalloutModule } from "../callout";
import { DatetimePickerModule } from "../datetime-picker";
import { FormModule } from "../form";
import { I18nUIModule } from "../i18n";
import { TimeRangePickerComponent } from "./time-range-picker.component";

const publicComponents = [TimeRangePickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        CalloutModule,
        ButtonsModule,
        DatetimePickerModule,
        I18nUIModule,
        FormsModule,
        ReactiveFormsModule,
        FormModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class TimeRangePickerModule {
}
