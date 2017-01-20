import { Component, ContentChildren, Input, QueryList, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Params, Router } from "@angular/router";

interface BreadcrumbData {
    name: string;
    label: string;
}

interface Breadcrumb {
    data: BreadcrumbData;
    params: Params;
    url: string;
}

interface RouteComponent {
    breadcrumb: (params: any) => BreadcrumbData;
}

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
    public crumbs: Breadcrumb[];

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            let cls: any = this.activatedRoute.component;
            console.log("CHnage url", event.url, cls.name);

            // let root: ActivatedRoute = this.activatedRoute.root;
            // this.breadcrumbs = this.getBreadcrumbs(root);
            let root: ActivatedRoute = this.activatedRoute.root;
            console.log("Breadcrumb", this.getBreadcrumb(root));
            this.crumbs = [this.getBreadcrumb(root)];
        });
    }

    private getBreadcrumb(route: ActivatedRoute, url: string = "", breadcrumb: Breadcrumb = null): Breadcrumb {

        let children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumb;
        }

        for (let child of children) {
            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }

            let routeURL: string = child.snapshot.url.map(segment => segment.path).join("/");

            url += `/${routeURL}`;
            const component: RouteComponent = child.snapshot.component as any;
            let data: BreadcrumbData;
            console.log("Component is", component);
            if (component.breadcrumb) {
                data = component.breadcrumb(child.snapshot.params);
            } else {
                console.error("Bnana is not true");
            }
            breadcrumb = {
                data,
                params: child.snapshot.params,
                url: url,
            };

            return this.getBreadcrumb(child, url, breadcrumb);
        }
        return breadcrumb;
    }
}
