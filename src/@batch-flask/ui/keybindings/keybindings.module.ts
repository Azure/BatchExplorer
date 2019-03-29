import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonsModule } from "../buttons";
import { FormModule } from "../form";
import { TableModule } from "../table";
import { KeyBindingListenerDirective } from "./keybindings-listener.directive";
import { KeyBindingsComponent } from "./keybindings.component";

const publicComponents = [KeyBindingsComponent, KeyBindingListenerDirective];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, TableModule, FormsModule, ReactiveFormsModule, FormModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [KeyBindingsComponent],
})
export class KeyBindingsModule {
}
