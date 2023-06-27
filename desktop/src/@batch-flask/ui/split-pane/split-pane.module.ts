import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { SplitPaneComponent } from "./split-pane.component";
import { SplitSeparatorComponent } from "./split-separator";

const privateComponents = [
    SplitSeparatorComponent,
];
const publicComponents = [
    SplitPaneComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [CommonModule, MaterialModule, RouterModule],
})
export class SplitPaneModule {

}
