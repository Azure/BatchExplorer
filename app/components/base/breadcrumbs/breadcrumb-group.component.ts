import { Component, ElementRef, HostListener, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Breadcrumb } from "./breadcrumb-models";
import { BreadcrumbService } from "./breadcrumb.service";

import "./breadcrumb-group.scss";

// Max number of breadcrumb to display without expanding
const expandableCount = 4;
@Component({
    selector: "bl-breadcrumb-group",
    templateUrl: "breadcrumb-group.html",
})
export class BreadcrumbGroupComponent implements OnDestroy {
    public crumbs: Breadcrumb[] = [];
    public displayCrumbs: Breadcrumb[] = [];
    public expandable = false;
    public expanded = false;

    private _subscription: Subscription;

    constructor(breadcrumbService: BreadcrumbService, private elementRef: ElementRef) {
        this._subscription = breadcrumbService.crumbs.subscribe((crumbs) => {
            this.crumbs = crumbs;
            this.expandable = crumbs.length > expandableCount;
            this._updateDisplayedCrumbs();
        });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    @HostListener("document:click", ["$event"])
    public onClick(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.expanded = false;
            this._updateDisplayedCrumbs();
        }
    }

    public expand(event: Event) {
        this.expanded = true;
        this._updateDisplayedCrumbs();
        event.stopImmediatePropagation();
    }

    private _updateDisplayedCrumbs() {
        const crumbs = this.crumbs;
        if (this.expandable && !this.expanded) {
            this.displayCrumbs = crumbs.slice(crumbs.length - 3, crumbs.length);
        } else {
            this.displayCrumbs = crumbs;
        }
    }
}
