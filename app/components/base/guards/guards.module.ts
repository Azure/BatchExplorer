import { NgModule } from "@angular/core";

import { HiddenIfNoAccountDirective } from "./hidden-navigation.directive";
import { NavigationGuard } from "./navigation-guard.component";

const components = [
    HiddenIfNoAccountDirective,
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
