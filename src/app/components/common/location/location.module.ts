import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { LocationComponent } from "./location.component";

const publicComponents = [LocationComponent];
const privateComponents = [];

@NgModule({
    imports: [BrowserModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class LocationModule {
}
