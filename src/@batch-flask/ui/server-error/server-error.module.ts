import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { ServerErrorComponent } from "./server-error.component";

const publicComponents = [ServerErrorComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ServerErrorModule {
}
