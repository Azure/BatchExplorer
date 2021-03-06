import { DependencyName, getEnvironment, getLogger } from "@batch/ui-common";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { action, IObservableArray, makeObservable, observable } from "mobx";
import { AbstractModelListView, SelectableListView } from "../view";
import { Certificate } from "./certificate-models";
import type { CertificateService } from "./certificate-service";

/**
 * Observable data store for lists of certificates
 */
export class CertificateListView
    extends AbstractModelListView<CertificateService, Certificate>
    implements SelectableListView<Certificate>
{
    @observable selectedItems: IObservableArray<Certificate>;
    @observable batchAccount: string;

    private logger = getLogger();

    constructor(service: CertificateService, models: Certificate[] = []) {
        super(service, models);
        this.selectedItems = observable([]);
        // TODO: Get Batch account either from the URL or the context
        this.batchAccount = "prodtest1";
        makeObservable(this);
    }

    @action
    update(items: Certificate[]): void {
        this.clear();
        for (const cert of items) {
            this.items.push(cert);
        }
    }

    firstSelection(): Certificate | null {
        if (this.selectedItems.length > 0) {
            return this.selectedItems[0];
        }
        return null;
    }

    @action
    selectByIndex(index: number): void {
        if (this.items[index]) {
            this.selectedItems.push(this.items[index]);
        } else {
            this.logger.warn("Could not select item at index " + index);
        }
    }

    @action
    clearSelection(): void {
        this.selectedItems.clear();
    }

    /**
     * Gets new models from the service and updates the model list
     */
    async load(): Promise<void> {
        // KLUDGE: Mock out the call to list certificates until HTTP auth is supported
        const httpClient: MockHttpClient = getEnvironment().getInjectable(
            DependencyName.HttpClient
        );
        const certUrl =
            "https://prodtest1.brazilsouth.batch.azure.com/certificates?api-version=2020-09-01.12.0";
        httpClient.addExpected(
            new MockHttpResponse(
                certUrl,
                200,
                `{
                    "value": [
                        {
                            "thumbprint": "bd7c0d29efad85c5174364c330db1698b14f7f55",
                            "thumbprintAlgorithm": "sha1",
                            "url": "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)",
                            "state": "active",
                            "stateTransitionTime": "2021-05-22T15:42:27.189Z",
                            "publicData": "MIICMTCCAZqgAwIBAgIQGroSHQekS6dHgBwHcOmihzANBgkqhkiG9w0BAQUFADBXMVUwUwYDVQQDHkwAewAxADAAQQBDADEAQQAzAEMALQBFADgAQgAwAC0ANABCADMANgAtADgAMAA0AEYALQBFADkARQBFAEEANwBGADQANgBEAEEAQQB9MB4XDTE2MDMwODAwMjcyM1oXDTE3MDMwODA2MjcyM1owVzFVMFMGA1UEAx5MAHsAMQAwAEEAQwAxAEEAMwBDAC0ARQA4AEIAMAAtADQAQgAzADYALQA4ADAANABGAC0ARQA5AEUARQBBADcARgA0ADYARABBAEEAfTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvUBbyvBVcVfL3eGBUQDBi6+LNYz5YCyxXZD22b0jKBvjwyY6tzvFPW/dZsSJ9ruwkc5YX4O9iS366z9ot3ZDcXP1jievVmT+ljFpBScrNDtHtw4NGSBYbb4JGqHPpvUMNbLDc+0pOBC2N2jS7umujAIt1RWuNi/rrgBiDkF3qrkCAwEAATANBgkqhkiG9w0BAQUFAAOBgQAnnTicnJhJpAsQbv72/7VfqI5OdUt9YkSo0FKCcDPYCDeZ3AaVfDENMHBgOsiCd8KyZx8pTqF6SzelF5W7pl6TEWuhCDCC9hCs8ecgsY38ZdixTEacQYYStmYsQ/PS1/4/J/40Dum5T4c76kv8r/dd1IAHjPdiNalFWOtSSu4NVA=="
                        },
                        {
                            "thumbprint": "some-fake-thumbprint",
                            "thumbprintAlgorithm": "sha1",
                            "url": "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=some-fake-thumbprint)",
                            "state": "deleting",
                            "stateTransitionTime": "2021-05-21T15:41:27.189Z",
                            "publicData": "fake-data"
                        },
                        {
                            "thumbprint": "some-fake-thumbprint2",
                            "thumbprintAlgorithm": "sha1",
                            "url": "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=some-fake-thumbprint)",
                            "state": "active",
                            "stateTransitionTime": "2021-05-21T15:41:27.189Z",
                            "publicData": "fake-data"
                        }
                    ],
                    "odata.nextLink": null
                }`
            )
        );

        const result = await this.service.listAll();
        this.update(result.models);
    }
}
