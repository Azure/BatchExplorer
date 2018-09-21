import { NgModule } from "@angular/core";
import { HelpMenu } from "client/menu/help-menu";
import { MainApplicationMenu } from "./main-application-menu";

@NgModule({
    providers: [
        HelpMenu,
        MainApplicationMenu,
    ],
})
export class MenuModule {
}
