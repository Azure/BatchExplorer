import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { I18nUIModule } from "@batch-flask/ui/i18n";
import { PartialSortWarningComponent } from "./partial-sort-warning";

const publicComponents = [PartialSortWarningComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, I18nUIModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class AbstractListModule {
}
