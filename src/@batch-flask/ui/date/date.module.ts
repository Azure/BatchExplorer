import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
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
