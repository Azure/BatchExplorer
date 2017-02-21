import { AfterViewInit, Component, ContentChildren, Input, QueryList } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { TabComponent } from "./tab.component";

@Component({
    selector: "bl-tab-group",
    templateUrl: "tab-group.html",
})
export class TabGroupComponent implements AfterViewInit {
    @Input()
    public dataKey = "tab";

    @ContentChildren(TabComponent)
    public tabs: QueryList<TabComponent>;

    public selectedIndex = new BehaviorSubject(0);
    public selectedTabKey: string = null;

    constructor(private router: Router, private activeRoute: ActivatedRoute) {
        this.activeRoute.queryParams.subscribe((data) => {
            if (this.dataKey in data) {
                this.selectedTabKey = data[this.dataKey];
                this._updateSelectedTab();
            }
        });
    }

    public ngAfterViewInit() {
        this._updateSelectedTab();
        this.tabs.changes.subscribe(() => {
            this._updateSelectedTab();
        });
    }

    public changeTab(event) {
        if (event.index === this.selectedIndex.getValue()) {
            return;
        }
        const tab = this.tabs.toArray()[event.index];
        const tabKey = tab.key;
        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: {
                [this.dataKey]: tabKey,
            },
        });
    }

    private _updateSelectedTab() {
        if (!this.tabs) {
            return;
        }
        this.tabs.some((tab, index) => {
            if (tab.key === this.selectedTabKey) {
                this.selectedIndex.next(index);
                return true;
            }
            return false;
        });

    }

}
