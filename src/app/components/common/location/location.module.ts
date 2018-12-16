import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LocationComponent } from "./location.component";

const publicComponents = [LocationComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class LocationModule {
}
