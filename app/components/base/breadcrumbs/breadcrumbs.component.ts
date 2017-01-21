import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
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
    name: string;
    breadcrumb: (params: any) => BreadcrumbData;
}

function breadcrumbMethodMessage(componentName) {
    const message = "The breadcrumb could not be generated because the route component"
        + ` '${componentName}' doesn't have the static breadcrumb method defined`;
    return `${message}
    class ${componentName} {
        // Add this method
        public static breadcrumb(params) {
            return {name: "Some name", label: "Some label"};
        }
    }
`;
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
    public crumbs: Breadcrumb[] = [];

    constructor(private router: Router, private activatedRoute: ActivatedRoute) {
        this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
            let cls: any = this.activatedRoute.component;
            console.log("CHnage url", event.url, cls.name);

            // let root: ActivatedRoute = this.activatedRoute.root;
            // this.breadcrumbs = this.getBreadcrumbs(root);
            let root: ActivatedRoute = this.activatedRoute.root;
            const crumb = this.getBreadcrumb(root);
            console.log("Breadcrumb", crumb);
            this.addBreadcrumb(crumb);
        });
    }

    public addBreadcrumb(breadcrumb: Breadcrumb) {
        this._cleanupCrumbs(breadcrumb);
        this.crumbs.push(breadcrumb);
    }

    private _cleanupCrumbs(breadcrumb: Breadcrumb) {
        if (this.crumbs.length === 0) {
            return;
        }
        const last = this.crumbs[this.crumbs.length - 1];
        console.log("LASt ", last.url, "cur", breadcrumb.url);
        if (last.url === breadcrumb.url || last.url.startsWith(breadcrumb.url)) {
            this.crumbs.pop();
            this._cleanupCrumbs(breadcrumb);
        }
    }

    private getBreadcrumb(route: ActivatedRoute, url = ""): Breadcrumb {
        if (route.children.length === 0) {
            return null;
        }

        for (let child of route.children) {
            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }
            let routeURL: string = child.snapshot.url.map(segment => segment.path).join("/");
            url += `/${routeURL}`;
            if (child.children.length === 0) {

                // Found deepest child
                const component: RouteComponent = child.snapshot.component as any;
                let data: BreadcrumbData;
                if (component.breadcrumb) {
                    data = component.breadcrumb(child.snapshot.params);
                } else {
                    console.error(breadcrumbMethodMessage(component.name));
                }
                return {
                    data,
                    params: child.snapshot.params,
                    url: url,
                };
            } else {
                return this.getBreadcrumb(child, url);
            }
        }
        return null;
    }

}
