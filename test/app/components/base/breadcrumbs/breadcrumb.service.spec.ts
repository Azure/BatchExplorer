import { Breadcrumb, BreadcrumbService } from "app/components/base/breadcrumbs";
import { Subject } from "rxjs";

const poolsCrumb: Breadcrumb = {
    url: "/pools",
    segments: ["pools"],
    componentName: "PoolDetailsHomeComponent",
    params: {},
    queryParams: {},
    data: {
        name: "Pools",
        label: "",
    },
};

const pool1Crumb: Breadcrumb = {
    url: "/pools/a",
    segments: ["pools", "a"],
    componentName: "PoolDetailsComponent",
    params: { id: "a" },
    queryParams: { tab: "nodes" },
    data: {
        name: "a",
        label: "Pool - nodes",
    },
};

const pool1PropertiesCrumb: Breadcrumb = {
    url: "/pools/a",
    segments: ["pools", "a"],
    componentName: "PoolDetailsComponent",
    params: { id: "a" },
    queryParams: { tab: "properties" },
    data: {
        name: "a",
        label: "Pool - properties",
    },
};

const node1Crumb: Breadcrumb = {
    url: "/pools/a/nodes/xyz",
    segments: ["pools", "a", "nodes", "xyz"],
    componentName: "NodeDetailsComponent",
    params: { id: "xyz", poolId: "a" },
    queryParams: {},
    data: {
        name: "xyz",
        label: "Node",
    },
};

const jobsCrumb: Breadcrumb = {
    url: "/jobs",
    segments: ["jobs"],
    componentName: "JobDetailsHomeComponent",
    params: {},
    queryParams: {},
    data: {
        name: "Jobs",
        label: "",
    },
};

describe("Breadcrumb service", () => {
    let service: BreadcrumbService;
    let routerSpy: any;

    beforeEach(() => {
        routerSpy = {
            events: new Subject(),
            navigate: jasmine.createSpy("router navigate option"),
        };
        service = new BreadcrumbService(routerSpy, null);
    });

    it("Compare segments should work", () => {
        const b1: any = {
            segments: ["pools", "a"],
        };
        const b2: any = {
            segments: ["pools", "a", "nodes", "xyz"],
        };
        const b3: any = {
            segments: ["jobs"],
        };
        const b4: any = {
            segments: ["pools", "b"],
        };
        expect(service.compareSegments(b1, b2)).toBe(true);
        expect(service.compareSegments(b1, b3)).toBe(false);
        expect(service.compareSegments(b1, b4)).toBe(false);
        expect(service.compareSegments(b1, null)).toBe(false);
        expect(service.compareSegments(undefined, b2)).toBe(false);
    });

    it("Navigate to breadcrumb call router navigate", () => {
        service.navigateTo(pool1Crumb);

        expect(routerSpy.navigate).toHaveBeenCalledOnce();
        expect(routerSpy.navigate).toHaveBeenCalledWith(["/pools/a"], {
            relativeTo: null,
            queryParams: { tab: "nodes" },
        });
    });

    describe("CreateBreadcrumb", () => {
        let errorSpy: jasmine.Spy;

        beforeEach(() => {
            errorSpy = spyOn(console, "error");
        });
        it("create a breadcrumb from a given route succeed", () => {
            const snapshot = {
                params: { id: "a" },
                queryParams: { tab: "properties" },
                component: {
                    name: "PoolDetailsComponent",
                    breadcrumb: ({id}, {tab}) => {
                        return { name: id, label: `Pool ${tab}` };
                    },
                },
            };
            const route = { snapshot };
            const path = ["pools", "a"];
            const breadCrumb = service.createBreadcrumbFromRoute(route as any, path);
            expect(breadCrumb).not.toBeNull();
            expect(breadCrumb.componentName).toEqual("PoolDetailsComponent");
            expect(breadCrumb.data.name).toEqual("a");
            expect(breadCrumb.data.label).toEqual("Pool properties");
            expect(breadCrumb.params).toEqual({ id: "a" });
            expect(breadCrumb.queryParams).toEqual({ tab: "properties" });
            expect(breadCrumb.url).toEqual("/pools/a");
            expect(breadCrumb.segments).toEqual(path);

            expect(errorSpy).not.toHaveBeenCalled();
        });

        it("create return null if component missing breadcrumb method", () => {
            const snapshot = {
                params: { id: "a" },
                queryParams: { tab: "properties" },
                component: {
                    name: "PoolDetailsComponent",
                },
            };
            const route = { snapshot };
            const path = ["pools", "a"];
            const breadCrumb = service.createBreadcrumbFromRoute(route as any, path);
            expect(errorSpy).toHaveBeenCalledOnce();
            expect(breadCrumb).toBeNull();
        });
    });

    describe("Add a breadcrumb", () => {
        let crumbs: Breadcrumb[];

        beforeEach(() => {
            service.addBreadcrumb(poolsCrumb);
            service.addBreadcrumb(pool1Crumb);
            service.crumbs.subscribe(x => crumbs = x);
        });

        it("should have the right breadcrumb to start with", () => {
            expect(crumbs.length).toBe(2);
        });

        it("Should add the node crumb to the top of it", () => {
            service.addBreadcrumb(node1Crumb);
            expect(crumbs.length).toBe(3);
            expect(crumbs[0]).toEqual(poolsCrumb);
            expect(crumbs[1]).toEqual(pool1Crumb);
            expect(crumbs[2]).toEqual(node1Crumb);
        });

        it("Changing queryParams should replace the last breadcrumb", () => {
            service.addBreadcrumb(pool1PropertiesCrumb);
            expect(crumbs.length).toBe(2);
            expect(crumbs[0]).toEqual(poolsCrumb);
            expect(crumbs[1]).toEqual(pool1PropertiesCrumb);
        });

        it("Changint to jobs should backtrack", () => {
            service.addBreadcrumb(jobsCrumb);
            expect(crumbs.length).toBe(1);
            expect(crumbs[0]).toEqual(jobsCrumb);
        });
    });
});
