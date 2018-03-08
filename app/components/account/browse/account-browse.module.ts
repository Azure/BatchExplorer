import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { AccountDropDownComponent } from "./account-dropdown.component";
import { AccountListComponent } from "./account-list";

const components = [AccountDropDownComponent, AccountListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule],
})
export class AccountBrowseModule {

}
