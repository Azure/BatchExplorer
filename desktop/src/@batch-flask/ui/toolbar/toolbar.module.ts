import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ToolbarComponent } from "./toolbar.component";

const publicComponents = [ToolbarComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ToolbarModule {
}
