import { ModuleWithProviders, NgModule } from "@angular/core";
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
    providers: [],
})

export class InfoBoxModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: InfoBoxModule,
            providers: [],
        };
    }
}
