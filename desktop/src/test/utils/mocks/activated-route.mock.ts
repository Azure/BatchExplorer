import { Observable, of } from "rxjs";

export interface ActivatedRouteMockAttributes {
    params: Observable<any>;
    queryParams: Observable<any>;
}

export class ActivatedRouteMock implements ActivatedRouteMockAttributes {
    public params: Observable<any>;
    public queryParams: Observable<any>;

    constructor(attrs: Partial<ActivatedRouteMockAttributes> = {}) {
        this.params = attrs.params || of({});
        this.queryParams = attrs.queryParams || of({});
    }
}
