import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { WelcomeComponent } from ".";
import { AuthModule } from "../auth";

const components = [WelcomeComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [ ...commonModules, AuthModule ],
})
export class WelcomeModule { }
