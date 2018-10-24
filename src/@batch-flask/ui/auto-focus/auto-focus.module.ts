import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AutoFocusDirective } from "./auto-focus.directive";

const publicComponents = [AutoFocusDirective];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AutoFocusModule {
}
