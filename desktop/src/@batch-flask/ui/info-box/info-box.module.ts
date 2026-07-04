import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InfoBoxComponent } from "./info-box.component";
import { I18nUIModule } from "../i18n";

const components = [
    InfoBoxComponent,
];

@NgModule({
    declarations: components,
    exports: [...components],
    imports: [RouterModule, I18nUIModule],
})

export class InfoBoxModule {
}
