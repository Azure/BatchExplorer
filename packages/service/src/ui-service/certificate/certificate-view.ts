import { HttpResponse } from "@batch/ui-common/lib/http";
import { makeObservable } from "mobx";
import { AbstractModelView } from "../view/model-view";
import { Certificate } from "./certificate-models";

export class CertificateView extends AbstractModelView<Certificate> {
    constructor(model?: Certificate, httpResponse?: HttpResponse) {
        super(model, httpResponse);
        makeObservable(this);
    }

    update(model?: Certificate): void {
        this.model = model;
    }
}
