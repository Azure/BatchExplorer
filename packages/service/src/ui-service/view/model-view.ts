import type { HttpResponse } from "@batch/ui-common/lib/http";
import { action, observable } from "mobx";
import { View } from "./view";

export interface ModelView<S, T> extends View {
    model?: T;
    service?: S;
    update(model?: T): void;
}

export abstract class AbstractModelView<S, T> implements ModelView<S, T> {
    @observable model?: T;
    @observable httpResponse?: HttpResponse;
    @observable loading: boolean;

    service?: S;

    constructor(service?: S, model?: T) {
        this.loading = false;
        this.service = service;
        this.update(model);
    }

    @action
    update(model?: T): void {
        this.model = model;
    }
}
