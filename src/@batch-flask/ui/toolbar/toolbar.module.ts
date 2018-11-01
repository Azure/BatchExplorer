import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ToolbarComponent } from "./toolbar.component";

const publicComponents = [ToolbarComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ToolbarModule {
}
