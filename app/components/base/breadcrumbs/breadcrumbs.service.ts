import { Injectable, Input, TemplateRef, Type, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Params, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

import { Constants } from "app/utils";

// /pools               => Pools
// /pools/a             => Pools > a
// /pools/a/nodes/xyz   => Pools > a > xyz
// /jobs                => jobs
export interface BreadcrumbData {
    name: string;
    label: string;
}

export interface Breadcrumb {
    data: BreadcrumbData;
    params: Params;
    queryParams: Params;
    componentName: string;
    segments: string[];
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
        this._loadInitialData();
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
        this._crumbs.subscribe((data) => {
            sessionStorage.setItem(Constants.sessionStorageKey.breadcrumb, JSON.stringify(data));
        });
    }


    public addBreadcrumb(breadcrumb: Breadcrumb) {
        const cleaned = this._cleanupCrumbs(breadcrumb);
        this._crumbs.next(cleaned.concat([breadcrumb]));
    }

    /**
     * Compare segments of 2 breadcrumb
     * If the 2 breadcrumb don't have the same base return false
     */
    public compareSegments(first: Breadcrumb, second: Breadcrumb) {
        const firstSegments = first.segments;
        const secondSegments = second.segments;

        for (let i = 0; i < Math.min(firstSegments.length, secondSegments.length); i++) {
            if (firstSegments[i] !== secondSegments[i]) {
                return false;
            }
        }

        return true;
    }

    public navigateTo(crumb: Breadcrumb) {
        this.router.navigateByUrl(crumb.url, {
            queryParams: crumb.queryParams,
        });
    }

    private _cleanupCrumbs(breadcrumb: Breadcrumb): Breadcrumb[] {
        const crumbs = this._crumbs.getValue();
        if (crumbs.length === 0) {
            return crumbs;
        }
        const last = crumbs[crumbs.length - 1];
        let removeLast = (
            last.url === breadcrumb.url                             // If same url don't add a new breadcrumb
            || last.url.startsWith(breadcrumb.url)                  // Breadcrumb goes back remove
            || last.componentName === breadcrumb.componentName    // If call the same component /pools/a => /pools/b
            || !this.compareSegments(last, breadcrumb)
        );

        if (removeLast) {
            crumbs.pop();
            this._cleanupCrumbs(breadcrumb);
        }

        return crumbs;
    }

    private _loadInitialData() {
        const breadCrumbStr = sessionStorage.getItem(Constants.sessionStorageKey.breadcrumb);
        if (breadCrumbStr) {
            try {
                const crumbs = JSON.parse(breadCrumbStr);
                console.log("Loaded initial crumbs", Object.assign({}, crumbs));
                this._crumbs.next(crumbs);
            } catch (e) {
                console.warn("Invalid error in breadcrumbs");
                sessionStorage.removeItem(Constants.sessionStorageKey.breadcrumb);
            }
        }
    }

    private getBreadcrumb(route: ActivatedRoute, segments = []): Breadcrumb {
        if (route.children.length === 0) {
            return null;
        }

        for (let child of route.children) {
            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }
            let current: string[] = child.snapshot.url.map(segment => segment.path);
            segments = segments.concat(current);
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
                    segments,
                    componentName: component.name,
                    queryParams: child.snapshot.queryParams,
                    params: child.snapshot.params,
                    url: `/${segments.join("/")}`,
                };
            } else {
                return this.getBreadcrumb(child, segments);
            }
        }
        return null;
    }
}
