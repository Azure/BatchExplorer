import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { FocusSectionComponent } from "./focus-section.component";
@NgModule({
    declarations: [
        FocusSectionComponent,
    ],
    exports: [
        FocusSectionComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule,
        MaterialModule,
    ],
})
export class FocusSectionModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: FocusSectionModule,
            providers: [],
        };
    }
}
