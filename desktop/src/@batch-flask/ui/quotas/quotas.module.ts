import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { QuotaDisplayComponent } from "./quota-display";
import { I18nUIModule } from "@batch-flask/ui/i18n";

const privateComponents = [];
const publicComponents = [QuotaDisplayComponent];

@NgModule({
    imports: [CommonModule, MatProgressBarModule, I18nUIModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class QuotasModule {

}
