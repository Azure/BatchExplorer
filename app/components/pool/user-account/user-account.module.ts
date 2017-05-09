import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { UserAccountPickerComponent } from "./user-account-picker.component";

const components = [
    UserAccountPickerComponent,
];

const modules = [
    ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
    ],
})
export class UserAccountModule {
}
