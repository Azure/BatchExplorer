import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InfoBoxComponent } from "./info-box.component";

const components = [
    InfoBoxComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [...components],
    imports: [RouterModule],
})

export class InfoBoxModule {
}
