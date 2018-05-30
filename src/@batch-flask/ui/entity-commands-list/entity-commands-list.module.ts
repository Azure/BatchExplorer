import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { ButtonsModule } from "@batch-flask/ui/buttons";
import { EntityCommandButtonComponent } from "./button";
import { EntityCommandsListComponent } from "./entity-commands-list.component";

const publicComponents = [
    EntityCommandsListComponent,

];
const privateComponents = [
    EntityCommandButtonComponent,
];

@NgModule({
    imports: [BrowserModule, ButtonsModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class EntityCommandsListModule {
}
