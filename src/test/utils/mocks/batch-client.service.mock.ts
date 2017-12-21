import { Observable } from "rxjs";

export class BatchClientServiceMock {
    constructor(public client: any) {

    }

    public get() {
        return Observable.of(this.client);
    }
}
