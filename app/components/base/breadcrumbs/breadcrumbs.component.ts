import { Component, Input, OnDestroy, TemplateRef, ViewChild } from "@angular/core";
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

@Component({
    selector: "bex-breadcrumbs",
    templateUrl: "./breadcrumbs.html",
})
export class BreadcrumbsComponent implements OnDestroy {
    public crumbs: Breadcrumb[] = [];

    private _subscription: Subscription;

    constructor(private breadcrumbService: BreadcrumbService) {
        this._subscription = breadcrumbService.crumbs.subscribe(x => this.crumbs = x);
    }

    public ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    public clickBreadcrumb(crumb: Breadcrumb) {
        this.breadcrumbService.navigateTo(crumb);
    }
}
