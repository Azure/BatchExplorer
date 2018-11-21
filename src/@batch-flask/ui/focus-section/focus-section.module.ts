import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { FocusSectionComponent } from "./focus-section.component";

@NgModule({
    declarations: [
        FocusSectionComponent,
    ],
    exports: [
        FocusSectionComponent,
    ],
    imports: [
        CommonModule,
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
