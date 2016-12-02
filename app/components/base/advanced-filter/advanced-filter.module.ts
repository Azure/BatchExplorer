import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { AdvancedFilterComponent } from "./advanced-filter.component";
import { AdvancedFilterStatePickerComponent } from "./state-picker-control";

@NgModule({
    declarations: [
        AdvancedFilterComponent,
        AdvancedFilterStatePickerComponent,
    ],
    entryComponents: [
    ],
    exports: [
        AdvancedFilterComponent,
        AdvancedFilterStatePickerComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule.forRoot(),
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
