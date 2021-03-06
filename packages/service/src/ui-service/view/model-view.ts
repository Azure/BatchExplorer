import type { HttpResponse } from "@batch/ui-common/lib/http";
import { observable } from "mobx";
import { View } from "./view";

export interface ModelView<T> extends View {
    model?: T;
    update(model?: T): void;
}

export abstract class AbstractModelView<T> implements ModelView<T> {
    @observable model?: T;
    @observable httpResponse?: HttpResponse;
    @observable loading: boolean;

    constructor(model?: T, httpResponse?: HttpResponse) {
        this.httpResponse = httpResponse;
        this.loading = false;
        this.update(model);
    }

    abstract update(model?: T): void;
}
