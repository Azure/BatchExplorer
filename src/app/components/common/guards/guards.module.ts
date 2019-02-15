import { NgModule } from "@angular/core";
import { SelectAccountDialogModule } from "./select-acccount-dialog";
import { HiddenIfNoAccountDirective } from "./hidden-navigation.directive";
import { RequireActiveBatchAccountGuard } from "./navigation-guard.component";

const components = [
    HiddenIfNoAccountDirective,
];

@NgModule({
    imports: [SelectAccountDialogModule],
    declarations: components,
    exports: components,
    providers: [
        RequireActiveBatchAccountGuard,
    ],
})
export class GuardsModule {

}
