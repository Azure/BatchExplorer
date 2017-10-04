import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { BaseModule } from "app/components/base";
import { AccountDropDownComponent } from "./account-dropdown.component";
import { AccountFavListComponent } from "./account-fav-list.component";
import { AccountListComponent } from "./account-list.component";

const components = [AccountDropDownComponent, AccountListComponent, AccountFavListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class AccountBrowseModule {

}
