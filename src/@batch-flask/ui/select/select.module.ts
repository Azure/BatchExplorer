import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { SelectOptionComponent } from "./option";
import { SelectComponent } from "./select.component";

const publicComponents = [SelectComponent, SelectOptionComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, ReactiveFormsModule, FormsModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class SelectModule {
}
