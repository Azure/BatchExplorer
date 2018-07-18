import { NgModule } from "@angular/core";
import { I18nService } from "./i18n.service";
import { LocaleService } from "./locale.sevice";

@NgModule({
    providers: [I18nService, LocaleService],
})
export class I18nModule {

}
