import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
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
