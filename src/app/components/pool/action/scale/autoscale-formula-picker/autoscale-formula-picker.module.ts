import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BaseModule } from "@batch-flask/ui";
import { AutoscaleFormulaPickerComponent } from "./autoscale-formula-picker.component";
import { EvaluateAutoScaleForumlaComponent } from "./evaluate-autoscale-formula";

const publicComponents = [AutoscaleFormulaPickerComponent];
const privateComponents = [EvaluateAutoScaleForumlaComponent];

@NgModule({
    imports: [BaseModule, CommonModule, FormsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AutoScaleFormulaPickerModule {
}
