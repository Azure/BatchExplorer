import { NgModule } from "@angular/core";

import { NavigationDisabledDirective } from "./navigation-disabled.directive";
import { NavigationGuard } from "./navigation-guard.component";

const components = [
    NavigationDisabledDirective,
];

@NgModule({
    declarations: components,
    exports: components,
    providers: [
        NavigationGuard,
    ],
})
export class GuardsModule {

}
