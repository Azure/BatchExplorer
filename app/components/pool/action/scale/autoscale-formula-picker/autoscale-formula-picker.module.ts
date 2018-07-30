import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BaseModule } from "@batch-flask/ui";
import { AutoscaleFormulaPickerComponent } from "./autoscale-formula-picker.component";
import { EvaluateAutoScaleForumlaComponent } from "./evaluate-autoscale-formula";

const publicComponents = [AutoscaleFormulaPickerComponent];
const privateComponents = [EvaluateAutoScaleForumlaComponent];

@NgModule({
    imports: [BaseModule, BrowserModule, FormsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AutoScaleFormulaPickerModule {
}
