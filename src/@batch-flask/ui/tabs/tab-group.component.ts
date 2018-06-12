import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChildren, Input, OnInit, QueryList,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { TabComponent } from "./tab.component";

@Component({
    selector: "bl-tab-group",
    templateUrl: "tab-group.html",
})
export class TabGroupComponent implements AfterViewInit, OnInit {
    @Input() public dataKey = "tab";

    @ContentChildren(TabComponent)
    public tabs: QueryList<TabComponent>;

    public selectedIndex = 0;
    public selectedTabKey: string = null;

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef) { }

    public ngOnInit() {
        this.activeRoute.queryParams.subscribe((data) => {
            if (this.dataKey in data) {
                this.selectedTabKey = data[this.dataKey];
                this._updateSelectedTab();
            }
        });
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this._updateSelectedTab();
        });
        this.tabs.changes.subscribe(() => {
            this._updateSelectedTab();
        });
    }

    public changeTab(index: number) {
        if (index === this.selectedIndex) {
            return;
        }
        const tab = this.tabs.toArray()[index];
        const tabKey = tab.key;
        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: {
                [this.dataKey]: tabKey,
            },
        });
    }

    public detectChanges() {
        this.changeDetector.markForCheck();
    }

    public trackTab(index, tab: TabComponent) {
        return tab.key;
    }

    private _updateSelectedTab() {
        if (!this.tabs) {
            return;
        }
        this.tabs.some((tab, index) => {
            if (tab.key === this.selectedTabKey) {
                this.selectedIndex = index;
                return true;
            }
            return false;
        });
        this.changeDetector.markForCheck();
    }
}
