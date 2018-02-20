import { Component, ContentChild } from "@angular/core";

import { BrowseLayoutListDirective } from "./browse-layout-list";
import "./browse-layout.scss";

@Component({
    selector: "bl-browse-layout",
    templateUrl: "browse-layout.html",
})
export class BrowseLayoutComponent {
    @ContentChild(BrowseLayoutListDirective) public listDirective;
}
