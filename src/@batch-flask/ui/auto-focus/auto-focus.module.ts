import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AutofocusDirective } from "./auto-focus.directive";

const publicComponents = [AutofocusDirective];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AutoFocusModule {
}
