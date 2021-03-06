import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DateComponent } from "./date.component";

const publicComponents = [DateComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class DateModule {
}
