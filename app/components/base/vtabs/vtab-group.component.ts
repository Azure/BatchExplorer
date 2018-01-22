import { AfterViewInit, Component, ContentChildren, QueryList } from "@angular/core";

import { VTabComponent } from "./vtab.component";

@Component({
    selector: "bl-vtab-group",
    templateUrl: "vtab-group.html",
})
export class VTabGroupComponent implements AfterViewInit {
    @ContentChildren(VTabComponent) public tabs: QueryList<VTabComponent>;

    public currentTab: VTabComponent;

    public ngAfterViewInit() {
        setTimeout(() => {
            this.currentTab = this.tabs.toArray().first();
        });
    }

    public selectTab(tab: VTabComponent) {
        this.currentTab = tab;
    }

    public trackTab(index, tab: VTabComponent) {
        return index;
    }
}
