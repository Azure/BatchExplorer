import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardComponent } from "./card.component";

const publicComponents = [CardComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class CardModule {
}
