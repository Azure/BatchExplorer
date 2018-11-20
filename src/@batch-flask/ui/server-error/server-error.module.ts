import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { ServerErrorComponent } from "./server-error.component";

const publicComponents = [ServerErrorComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class ServerErrorModule {
}
