import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { ThemeColorsComponent } from "./theme-colors";

const privateComponents = [
];

const publicComponents = [
    ThemeColorsComponent,
];

const modules = [
    ...commonModules,
];

@NgModule({
    declarations: [
        ...privateComponents,
        ...publicComponents,
    ],
    exports: [
        ...publicComponents,
    ],
    entryComponents: [
        ThemeColorsComponent,
    ],
    imports: modules,
})
export class MiscModule {

}
