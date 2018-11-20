import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AutoFocusDirective } from "./auto-focus.directive";

const publicComponents = [AutoFocusDirective];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AutoFocusModule {
}
