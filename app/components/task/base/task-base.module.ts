import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { BaseModule } from "app/components/base";
import { ResourcefilePickerComponent } from "./resourcefile-picker.component";
import { UserIdentityComponent } from "./user-identity";

const components = [ResourcefilePickerComponent, UserIdentityComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [
        BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule,
        ReactiveFormsModule,
    ],
})
export class TaskBaseModule {
}
