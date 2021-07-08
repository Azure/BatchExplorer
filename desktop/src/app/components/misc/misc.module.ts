import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { ThemeColorsComponent } from "./theme-colors";
import { PlaygroundRouteComponent } from "./playground-route";

const privateComponents = [
];

const publicComponents = [
    ThemeColorsComponent,
    PlaygroundRouteComponent
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
        PlaygroundRouteComponent
    ],
    imports: modules,
})
export class MiscModule {

}
