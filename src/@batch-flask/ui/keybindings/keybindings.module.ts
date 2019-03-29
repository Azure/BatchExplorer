import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormModule } from "../form";
import { TableModule } from "../table";
import { KeyBindingsComponent } from "./keybindings.component";

const publicComponents = [KeyBindingsComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, TableModule, FormsModule, ReactiveFormsModule, FormModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [KeyBindingsComponent],
})
export class KeyBindingsModule {
}
