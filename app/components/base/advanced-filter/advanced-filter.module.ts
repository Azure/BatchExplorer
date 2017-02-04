import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { AdvancedFilterComponent } from "./advanced-filter.component";
import { AdvancedFilterListComponent } from "./list-filter-control";
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
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
    providers: [
    ],
})
export class AdvancedFilterModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: AdvancedFilterModule,
            providers: [],
        };
    }
}
