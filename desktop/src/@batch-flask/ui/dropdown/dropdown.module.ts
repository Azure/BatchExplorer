import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { I18nUIModule } from "@batch-flask/ui/i18n";
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
        CommonModule,
        FormsModule,
        MaterialModule,
        ScrollableModule,
        ButtonsModule,
        I18nUIModule
    ],
})
export class DropdownModule {
}
