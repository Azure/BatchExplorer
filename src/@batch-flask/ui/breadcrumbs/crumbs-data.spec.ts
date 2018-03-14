import { Breadcrumb } from "@batch-flask/ui/breadcrumbs";

export const poolsCrumb: Breadcrumb = {
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

export const pool1Crumb: Breadcrumb = {
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

export const pool1PropertiesCrumb: Breadcrumb = {
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

export const node1Crumb: Breadcrumb = {
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

export const jobsCrumb: Breadcrumb = {
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
