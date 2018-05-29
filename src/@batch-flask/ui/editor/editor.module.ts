import { NgModule } from "@angular/core";

import { EditorComponent } from "./editor.component";
import { MonacoLoader } from "./monaco-loader.service";

const components = [EditorComponent];
@NgModule({
    declarations: components,
    imports: [],
    providers: [MonacoLoader],
    exports: components,
})
export class EditorModule {

}
