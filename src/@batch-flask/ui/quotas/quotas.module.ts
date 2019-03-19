import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material";
import { QuotaDisplayComponent } from "./quota-display";

const privateComponents = [];
const publicComponents = [QuotaDisplayComponent];

@NgModule({
    imports: [CommonModule, MatProgressBarModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class QuotasModule {

}
