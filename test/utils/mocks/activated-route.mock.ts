import { Observable } from "rxjs";

import { Partial } from "app/utils";

export interface ActivatedRouteMockAttributes {
    params: Observable<any>;
    queryParams: Observable<any>;
}

export class ActivatedRouteMock implements ActivatedRouteMockAttributes {
    public params: Observable<any>;
    public queryParams: Observable<any>;

    constructor(attrs: Partial<ActivatedRouteMockAttributes> = {}) {
        this.params = attrs.params || Observable.of({});
        this.queryParams = attrs.queryParams || Observable.of({});
    }
}
