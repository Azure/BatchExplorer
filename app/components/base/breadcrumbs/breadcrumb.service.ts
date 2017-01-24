import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";

import { Constants } from "app/utils";
import { Breadcrumb, BreadcrumbData, RouteComponent } from "./breadcrumb-models";


function breadcrumbMethodMessage(componentName) {
    const message = "The breadcrumb could not be generated because the route component"
        + ` '${componentName}' doesn't have the static breadcrumb method defined`;
    return `${message}
    class ${componentName} {
        // Add this method
        public static breadcrumb(params, queryParams) {
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
            let root: ActivatedRoute = this.activatedRoute.root;
            const crumb = this.getBreadcrumbFromRoute(root);
            if (crumb) {
                this.addBreadcrumb(crumb);
            }
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
        this.router.navigate([crumb.url], {
            relativeTo: this.activatedRoute,
            queryParams: crumb.queryParams,
        });
    }

    public getBreadcrumbFromRoute(route: ActivatedRoute, segments = []): Breadcrumb {
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
                return this.createBreadcrumbFromRoute(child, segments);
            } else {
                return this.getBreadcrumbFromRoute(child, segments);
            }
        }
        return null;
    }

    /**
     * Create the breadcrumb data structure from the given route and path
     */
    public createBreadcrumbFromRoute(route: ActivatedRoute, path: string[]): Breadcrumb {
        const component: RouteComponent = route.snapshot.component as any;
        const {params, queryParams} = route.snapshot;
        if (!component.breadcrumb) {
            console.error(breadcrumbMethodMessage(component.name));
            return null;
        }
        const data = component.breadcrumb(params, queryParams);
        return {
            data,
            segments: path,
            componentName: component.name,
            queryParams: queryParams,
            params: params,
            url: `/${path.join("/")}`,
        };
    }

    private _cleanupCrumbs(breadcrumb: Breadcrumb): Breadcrumb[] {
        const crumbs = this._crumbs.value;
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
                this._crumbs.next(crumbs);
            } catch (e) {
                console.warn("Invalid error in breadcrumbs");
                sessionStorage.removeItem(Constants.sessionStorageKey.breadcrumb);
            }
        }
    }
}
