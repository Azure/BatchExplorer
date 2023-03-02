// import { HttpResponse } from "@batch/ui-common/lib/http";
import { CertificateService, getMockURL } from "./certificate-service";
import {
    makeObservable,
    action,
    runInAction,
    // computed,
    observable,
    reaction,
    toJS,
} from "mobx";
import { AbstractModelView } from "../view/model-view";
import { Certificate } from "./certificate-models";

import { DependencyName, getEnvironment, getLogger } from "@batch/ui-common";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { CertificateListView } from "./certificate-list-view";

interface CertificateViewCtorOptions {
    model?: Certificate;
    service?: CertificateService;
    listView?: CertificateListView;
}

export class CertificateView extends AbstractModelView<
    CertificateService,
    Certificate
> {
    @observable
    isRefreshing = false;

    private logger = getLogger();

    private _listView?: CertificateListView;

    constructor(options: CertificateViewCtorOptions) {
        super(options.service, options.model);
        this._listView = options.listView;
        makeObservable(this);

        reaction(
            () => this.model?.state,
            (state) => {
                if (state === "deleting") {
                    this._deletePolling();
                }
            },
            { fireImmediately: true }
        );
    }

    @action
    async delete() {
        if (!this.model?.thumbprint || !this.service) {
            return;
        }
        MockDeleteTemp(this.model);
        await this.service.deleteMethod(this.model);
        this.model.state = "deleting";
    }

    @action
    async refresh() {
        if (!this.model?.thumbprint || !this.service) {
            return;
        }
        this.isRefreshing = true;
        try {
            await this._get();
        } finally {
            runInAction(() => {
                this.isRefreshing = false;
            });
        }
    }

    @action
    async reactivate() {
        if (!this.model?.thumbprint || !this.service) {
            return;
        }
        await this.service.cancelDeletion(this.model);
    }

    async exportToJson() {
        // TODO to be implemented
        return JSON.stringify(this.model);
    }

    private async _get() {
        if (!this.model?.thumbprint || !this.service) {
            return;
        }
        MockGetTemp(this.model);
        const result = await this.service.get(
            this.model.thumbprint,
            this.model.thumbprintAlgorithm
        );
        this.update(result.model);
        return result;
    }

    private async _deletePolling() {
        this.logger.debug("polling for", this.model?.thumbprint);
        const res = await this._get();
        if (res && res.response.status === 404) {
            // certificate is deleted
            this._listView?.onDeleteItem(this);
            return;
        }
        if (this.model?.state !== "deleting") {
            return;
        }
        setTimeout(() => {
            this._deletePolling();
        }, 2000);
    }
}

const deleteMap: Record<string, number> = {};

function MockDeleteTemp(cert: Certificate) {
    const httpClient: MockHttpClient = getEnvironment().getInjectable(
        DependencyName.HttpClient
    );

    const thumbprint = cert.thumbprint || "";
    deleteMap[thumbprint] = 0;

    httpClient.addExpected(
        new MockHttpResponse(getMockURL(cert), {
            status: 202,
        }),
        {
            method: "DELETE",
        }
    );
}

function MockGetTemp(cert: Certificate) {
    const httpClient: MockHttpClient = getEnvironment().getInjectable(
        DependencyName.HttpClient
    );

    const res = toJS(cert);
    let status = 200;

    // delete is successful after 3 polling.
    const thumbprint = cert.thumbprint || "";
    if (deleteMap[thumbprint] != undefined) {
        res.state = "deleting";
        if (++deleteMap[thumbprint] == 3) {
            status = 404;
        }
    }

    httpClient.addExpected(
        new MockHttpResponse(getMockURL(cert), {
            status,
            body: JSON.stringify(res),
            delayInMs: 1000,
        })
    );
}
