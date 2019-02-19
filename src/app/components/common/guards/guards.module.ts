import { NgModule } from "@angular/core";
import { HiddenIfNoAccountDirective } from "./hidden-navigation.directive";
import { RequireActiveBatchAccountGuard } from "./require-active-batch-account.guard";
import { SelectAccountDialogModule } from "./select-acccount-dialog";

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
