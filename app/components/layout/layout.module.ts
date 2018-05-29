import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { AccountBrowseModule } from "app/components/account/browse";
import { FooterComponent, RpcServerStatusComponent } from "./footer";
import { HeaderComponent } from "./header";
import { PinnedDropDownComponent } from "./pinned-entity-dropdown";

const components = [
    FooterComponent, HeaderComponent, RpcServerStatusComponent, PinnedDropDownComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [commonModules, AccountBrowseModule],
})
export class LayoutModule {

}
