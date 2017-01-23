import { Injectable, Input, TemplateRef, Type, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Params, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

export interface BreadcrumbData {
    name: string;
    label: string;
}

export interface Breadcrumb {
    data: BreadcrumbData;
    params: Params;
    component: RouteComponent;
    url: string;
}

export interface RouteComponent extends Type<any> {
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

@Injectable()
export class BreadcrumbService {
    public crumbs: Observable<Breadcrumb[]>;
    public _crumbs = new BehaviorSubject<Breadcrumb[]>([]);

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
        this.crumbs = this._crumbs.asObservable();
    }


    public addBreadcrumb(breadcrumb: Breadcrumb) {
        const cleaned = this._cleanupCrumbs(breadcrumb);
        this._crumbs.next(cleaned.concat([breadcrumb]));
    }

    private _cleanupCrumbs(breadcrumb: Breadcrumb): Breadcrumb[] {
        const crumbs = this._crumbs.getValue();
        if (crumbs.length === 0) {
            return crumbs;
        }
        const last = crumbs[crumbs.length - 1];
        console.log("Crubm", last, breadcrumb);
        const removeLast = (
            last.url === breadcrumb.url                             // If same url don't add a new breadcrumb
            || last.url.startsWith(breadcrumb.url)                  // Breadcrumb goes back remove
            || last.component.name === breadcrumb.component.name    // If call the same component /pools/a => /pools/b
        );
        console.log("LASt ", removeLast, last.url, "cur", breadcrumb.url);
        if (removeLast) {
            crumbs.pop();
            this._cleanupCrumbs(breadcrumb);
        }

        return crumbs;
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
                    component,
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
