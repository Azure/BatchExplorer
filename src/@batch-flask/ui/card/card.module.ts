import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CardComponent } from "./card.component";

const publicComponents = [CardComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class CardModule {
}
