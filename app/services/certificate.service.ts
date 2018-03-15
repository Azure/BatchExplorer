import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable, Subject } from "rxjs";

import { Certificate } from "app/models";
import { CertificateCreateDto } from "app/models/dtos";
import { Constants, log } from "app/utils";
import { BatchClientService } from "./batch-client.service";
import {
    BatchEntityGetter, BatchListGetter, ContinuationToken,
    DataCache, EntityView, ListOptionsAttributes, ListView,
} from "./core";
import { ServiceBase } from "./service-base";

export interface CertificateListParams {
}

export interface CertificateParams {
    thumbprint?: string;
    thumbprintAlgorithm?: string;
}

export interface CertificateListOptions extends ListOptionsAttributes {
}

const defaultThumbprintAlgorithm = "sha1";

@Injectable()
export class CertificateService extends ServiceBase {
    /**
     * Triggered only when a certificate is added through this app.
     * Used to notify the list of a new item
     */
    public onCertificateAdded = new Subject<string>();
    public cache = new DataCache<Certificate>();

    private _basicProperties: string = "thumbprint,thumbprintAlgorithm,state,stateTransitionTime";
    private _getter: BatchEntityGetter<Certificate, CertificateParams>;
    private _listGetter: BatchListGetter<Certificate, CertificateListParams>;

    constructor(batchService: BatchClientService) {
        super(batchService);

        this._getter = new BatchEntityGetter(Certificate, this.batchService, {
            cache: () => this.cache,
            getFn: (client, params: CertificateParams) => {
                const algorithm = params.thumbprintAlgorithm || defaultThumbprintAlgorithm;
                return client.certificate.get(algorithm, params.thumbprint);
            },
        });

        this._listGetter = new BatchListGetter(Certificate, this.batchService, {
            cache: () => this.cache,
            list: (client, params: CertificateListParams, options) => {
                return client.certificate.list({ certificateListOptions: options });
            },
            listNext: (client, nextLink: string) => client.certificate.listNext(nextLink),
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options?: any, forceNew?: boolean);
    public list(nextLink: ContinuationToken);
    public list(nextLinkOrOptions: any, options = {}, forceNew = false) {
        if (nextLinkOrOptions.nextLink) {
            return this._listGetter.fetch(nextLinkOrOptions);
        } else {
            return this._listGetter.fetch({}, options, forceNew);
        }
    }

    public listView(options: ListOptionsAttributes = {}): ListView<Certificate, CertificateListParams> {
        return new ListView({
            cache: () => this.cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAll(options: CertificateListOptions = {}): Observable<List<Certificate>> {
        return this._listGetter.fetchAll({}, options);
    }

    public get(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string): Observable<Certificate> {
        const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
        return this._getter.fetch({ thumbprintAlgorithm: algorithm, thumbprint: thumbprint });
    }

    /**
     * Create an entity view for a certificate
     */
    public view(): EntityView<Certificate, CertificateParams> {
        return new EntityView({
            cache: () => this.cache,
            getter: this._getter,
            poll: Constants.PollRate.entity,
        });
    }

    public delete(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string)
    : Observable<{}> {
        return this.callBatchClient((client) => {
            const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
            return client.certificate.delete(algorithm, thumbprint, options);
        }, (error) => {
            log.error(`Error cancel delete certificate: ${thumbprint}`, error);
        });
    }

    public add(certificate: CertificateCreateDto, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.certificate.add(certificate.toJS(), options));
    }

    public cancelDelete(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string) {
        return this.callBatchClient((client) => {
            const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
            return client.certificate.cancelDelete(algorithm, thumbprint, options);
        }, (error) => {
            log.error(`Error cancel delete certificate: ${thumbprint}`, error);
        });
    }
}
