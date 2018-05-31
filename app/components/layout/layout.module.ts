import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { AccountBrowseModule } from "app/components/account/browse";
import { FooterComponent, RpcServerStatusComponent } from "./footer";
import { HeaderComponent } from "./header";
import { MainNavigationComponent, ProfileButtonComponent } from "./main-navigation";
import { PinnedDropDownComponent } from "./pinned-entity-dropdown";

const privateComponents = [
    ProfileButtonComponent,
];

const publicComponents = [
    FooterComponent,
    HeaderComponent,
    RpcServerStatusComponent,
    PinnedDropDownComponent,
    MainNavigationComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [commonModules, AccountBrowseModule],
})
export class LayoutModule {

}
