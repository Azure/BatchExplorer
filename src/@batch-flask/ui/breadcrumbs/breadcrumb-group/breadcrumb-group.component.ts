import { Component, ElementRef, HostListener, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Breadcrumb } from "..//breadcrumbs.model";
import { BreadcrumbService } from "../breadcrumb.service";

import "./breadcrumb-group.scss";

@Component({
    selector: "bl-breadcrumb-group",
    templateUrl: "breadcrumb-group.html",
})
export class BreadcrumbGroupComponent implements OnDestroy {
    public crumbs: Breadcrumb[] = [];

    private _subscription: Subscription;
    private _lastCrumbCount = 0;

    constructor(breadcrumbService: BreadcrumbService, private elementRef: ElementRef) {
        this._subscription = breadcrumbService.crumbs.subscribe((crumbs) => {
            this.crumbs = crumbs;
            if (crumbs.length > this._lastCrumbCount) {
                setTimeout(() => {
                    this.elementRef.nativeElement.scrollLeft = this.elementRef.nativeElement.scrollWidth;
                });
            }
        });
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    public trackByFn(index, crumb: Breadcrumb) {
        return index;
    }

    @HostListener("mousewheel", ["$event"])
    public mouseWheelMoves(event: WheelEvent) {
        this.elementRef.nativeElement.scrollLeft -= (event.wheelDelta > 0 ? 10 : -10);
    }
}
