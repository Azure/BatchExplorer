import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { DateComponent } from "./date.component";

const publicComponents = [DateComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class DateModule {
}
