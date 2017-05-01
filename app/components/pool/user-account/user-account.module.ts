import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { UserAccountsPickerComponent } from "./user-accounts-picker.component";

const components = [
    UserAccountsPickerComponent,
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
