import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChild } from "@angular/core";

import { BrowseLayoutListDirective } from "./browse-layout-list";
import "./browse-layout.scss";

@Component({
    selector: "bl-browse-layout",
    templateUrl: "browse-layout.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseLayoutComponent implements AfterViewInit {
    @ContentChild(BrowseLayoutListDirective) public listDirective;

    public ngAfterViewInit() {
        if (!this.listDirective) {
            throw new Error("BrowseLayout expect an list component to have the directive blBrowseLayoutList");
        }
        this.listDirective.component.quicklist = true;
    }
}
