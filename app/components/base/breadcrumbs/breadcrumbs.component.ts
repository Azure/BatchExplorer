import { Component, ContentChildren, Input, QueryList, TemplateRef, ViewChild } from "@angular/core";

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
export class BreadcrumbsComponent {

    @ContentChildren(CrumbComponent)
    public crumbs: QueryList<CrumbComponent>;
}
