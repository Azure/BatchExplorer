import { Type } from "@angular/core";
import { Params } from "@angular/router";

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
    breadcrumb: (params: Params, queryParams: Params) => BreadcrumbData;
}
