import { NgModule } from "@angular/core";

import { BrowseLayoutListDirective } from "./browse-layout-list";
import { BrowseLayoutComponent } from "./browse-layout.component";
import { ListBaseComponent } from "./list-base";

const privateComponents = [];
const publicComponents = [BrowseLayoutComponent, BrowseLayoutListDirective];

@NgModule({
    imports: [],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class BrowseLayoutModule {
}
