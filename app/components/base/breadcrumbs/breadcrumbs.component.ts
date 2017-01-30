import { Component, ElementRef, HostListener, Input, OnDestroy, TemplateRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";

import { Breadcrumb } from "./breadcrumb-models";
import { BreadcrumbService } from "./breadcrumb.service";

@Component({
    selector: "bex-crumb",
    template: `<template><ng-content></ng-content></template>`,
})
export class CrumbComponent {
    @Input()
    public label: string;

    @Input()
    public routerLink: any;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

// Max number of breadcrumb to display without expanding
const expandableCount = 4;
@Component({
    selector: "bex-breadcrumbs",
    templateUrl: "breadcrumbs.html",
})
export class BreadcrumbsComponent implements OnDestroy {
    public crumbs: Breadcrumb[] = [];
    public displayCrumbs: Breadcrumb[] = [];
    public expandable = false;
    public expanded = false;

    private _subscription: Subscription;

    constructor(private breadcrumbService: BreadcrumbService, private elementRef: ElementRef) {
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
        console.log("Event target", event.target, this.elementRef.nativeElement,
            this.elementRef.nativeElement.contains(event.target));
        if (!this.elementRef.nativeElement.contains(event.target)) {
            console.log("Its outside");
            this.expanded = false;
            this._updateDisplayedCrumbs();
        }
    }

    public clickBreadcrumb(crumb: Breadcrumb) {
        this.breadcrumbService.navigateTo(crumb);
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
