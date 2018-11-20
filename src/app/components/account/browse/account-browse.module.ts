import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { CommonModule as BECommonModule } from "app/components/common";
import { AccountDropDownComponent } from "./account-dropdown.component";
import { AccountListComponent } from "./account-list";

const components = [AccountDropDownComponent, AccountListComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [CommonModule, MaterialModule, RouterModule, BaseModule, BECommonModule],
})
export class AccountBrowseModule {

}
