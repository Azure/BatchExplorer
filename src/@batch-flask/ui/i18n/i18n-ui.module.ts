import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { I18nModule } from "@batch-flask/core";
import { I18nPipe } from "./i18n.pipe";

const publicComponents = [I18nPipe];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, I18nModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class I18nUIModule {
}
