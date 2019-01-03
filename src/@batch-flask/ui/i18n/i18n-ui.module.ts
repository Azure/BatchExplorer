import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { I18nModule } from "@batch-flask/core";
import { I18nComponent, I18nParameterDirective } from "./i18n.component";
import { I18nPipe } from "./i18n.pipe";

const publicComponents = [I18nPipe, I18nComponent, I18nParameterDirective];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, I18nModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class I18nUIModule {
}
