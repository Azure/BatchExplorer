import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { AccountBrowseModule } from "app/components/account/browse";
import { WorkspaceModule } from "app/components/workspace";
import { FooterComponent, RpcServerStatusComponent, TimezoneDropdownComponent, VersionTypeComponent } from "./footer";
import { HeaderComponent } from "./header";
import { MainNavigationComponent, ProfileButtonComponent } from "./main-navigation";
import { OnlineStatusComponent } from "./online-status";
import { PinnedDropDownComponent } from "./pinned-entity-dropdown";

const privateComponents = [
    ProfileButtonComponent,
    OnlineStatusComponent,
    TimezoneDropdownComponent,
];

const publicComponents = [
    FooterComponent,
    HeaderComponent,
    RpcServerStatusComponent,
    VersionTypeComponent,
    PinnedDropDownComponent,
    MainNavigationComponent,
];

@NgModule({
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
    imports: [commonModules, AccountBrowseModule, WorkspaceModule],
})
export class LayoutModule {
}
