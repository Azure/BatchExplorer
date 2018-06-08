import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
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
        ButtonsModule,
    ],
})
export class DropdownModule {
}
