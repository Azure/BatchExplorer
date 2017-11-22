import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { AccountBrowseModule } from "app/components/account/browse";
import { FooterComponent } from "./footer";

const components = [
    FooterComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, AccountBrowseModule],
})
export class LayoutModule {

}
