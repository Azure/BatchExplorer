import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { FormModule } from "@batch-flask/ui/form";
import { AdvancedFilterComponent } from "./advanced-filter.component";
import { AdvancedFilterListComponent } from "./list-filter-control/list-filter-control";
import { AdvancedFilterStatePickerComponent } from "./state-picker-control";

const components = [
    AdvancedFilterComponent,
    AdvancedFilterStatePickerComponent,
    AdvancedFilterListComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
    ],
    exports: components,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        FormModule,
    ],
})
export class AdvancedFilterModule {
}
