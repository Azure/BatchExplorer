
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { VTabGroupComponent } from "./vtab-group.component";
import { VTabComponent } from "./vtab.component";

const publicComponents = [
    VTabComponent,
    VTabGroupComponent,
];
@NgModule({
    exports: [...publicComponents],
    declarations: [...publicComponents],
    imports: [CommonModule, ButtonsModule],
})
export class VTabsModule { }
