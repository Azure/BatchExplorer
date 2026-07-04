import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CalloutComponent } from "./callout.component";
import { CalloutDirective } from "./callout.directive";

const publicComponents = [CalloutDirective, CalloutComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
})
export class CalloutModule {
}
