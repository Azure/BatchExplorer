import { NgModule } from "@angular/core";

import { EditorComponent } from "./editor.component";

const components = [EditorComponent];

@NgModule({
    declarations: components,
    imports: [],
    exports: components,
})
export class EditorModule {

}
