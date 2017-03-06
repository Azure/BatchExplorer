import { NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

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
