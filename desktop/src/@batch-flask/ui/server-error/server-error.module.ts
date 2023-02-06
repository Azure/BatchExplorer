import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { I18nUIModule } from "../i18n";
import { ServerErrorComponent } from "./server-error.component";

const publicComponents = [ServerErrorComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, ButtonsModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ServerErrorModule {
}
