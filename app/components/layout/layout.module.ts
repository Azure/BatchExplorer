import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { AccountBrowseModule } from "app/components/account/browse";
import { FooterComponent } from "./footer";
import { HeaderComponent } from "./header";

const components = [
    FooterComponent, HeaderComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [commonModules, AccountBrowseModule],
})
export class LayoutModule {

}
