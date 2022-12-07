import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { LoginComponent } from "./login.component";

@NgModule({
    declarations: [LoginComponent],
    exports: [LoginComponent],
    imports: [...commonModules]
})
export class LoginModule { }
