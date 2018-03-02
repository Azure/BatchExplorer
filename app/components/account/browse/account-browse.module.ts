import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { BaseModule } from "@bl-common/ui";
import { AccountDropDownComponent } from "./account-dropdown.component";
import { AccountListComponent } from "./account-list.component";

const components = [AccountDropDownComponent, AccountListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class AccountBrowseModule {

}
