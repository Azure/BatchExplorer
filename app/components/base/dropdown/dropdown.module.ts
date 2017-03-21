import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

import { ScrollableModule } from "../scrollable";
import { DropdownComponent } from "./dropdown.component";

@NgModule({
    declarations: [
        DropdownComponent,
    ],
    exports: [
        DropdownComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        ScrollableModule,
    ],
})
export class DropdownModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: DropdownModule,
            providers: [],
        };
    }
}
