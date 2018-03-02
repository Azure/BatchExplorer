import { Type } from "@angular/core";
import { Params } from "@angular/router";

export interface BreadcrumbData {
    name: string;
    icon?: string;
    label: string;
    invertName?: boolean;
}

export interface Breadcrumb {
    data: BreadcrumbData;
    params: Params;
    queryParams: Params;
    componentName: string;
    segments: string[];
    url: string;
    lockedFor?: string;
}

export interface RouteComponent extends Type<any> {
    name: string;
    breadcrumb: (params: Params, queryParams: Params) => BreadcrumbData;
}
