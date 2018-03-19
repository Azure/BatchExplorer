import { Injectable } from "@angular/core";
import { List } from "immutable";
import * as forge from "node-forge";
import { AsyncSubject, Observable, Subject } from "rxjs";

import { Certificate } from "app/models";
import { Constants, FileUrlUtils, log } from "app/utils";
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

export const defaultThumbprintAlgorithm = "sha1";

export enum CertificateFormat {
    pfx = "pfx",
    cer = "cer",
}

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

    public delete(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string): Observable<{}> {
        return this.callBatchClient((client) => {
            const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
            return client.certificate.delete(algorithm, thumbprint, options);
        }, (error) => {
            log.error(`Error cancel delete certificate: ${thumbprint}`, error);
        });
    }

    public add(certificate: any, options: any = {}): Observable<{}> {
        return this.callBatchClient((client) => client.certificate.add(certificate, options));
    }

    public cancelDelete(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string) {
        return this.callBatchClient((client) => {
            const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
            return client.certificate.cancelDeletion(algorithm, thumbprint, options);
        }, (error) => {
            log.error(`Error cancel delete certificate: ${thumbprint}`, error);
        });
    }

    /**
     * parseCertificate helps to parse uploaded certificate and return parameters which can be
     * used to create batch certificate
     * @param file uploaded certificate
     * @param password password for pfx certifcate
     */
    public parseCertificate(file: File, password: string) {
        const subject = new AsyncSubject();
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => {
            // try catch potential error when get thumbprint
            try {
                const certificateFormat = FileUrlUtils.getFileExtension(file.name);
                const binaryEncodedData = reader.result;
                const base64EncodedData = btoa(binaryEncodedData);
                const isCer = certificateFormat === CertificateFormat.cer;
                const data = isCer ? binaryEncodedData : base64EncodedData;
                const thumbprint = this._generateThumbprint(data,
                    CertificateFormat[certificateFormat], password);
                subject.next({
                    thumbprintAlgorithm: defaultThumbprintAlgorithm,
                    thumbprint: thumbprint,
                    data: base64EncodedData,
                    certificateFormat: certificateFormat,
                    password: !isCer ? password : null,
                });
                subject.complete();
            } catch (err) {
                subject.error(err);
            }
        };
        reader.onerror = () => {
            subject.error("Error encountered reading certificate file as binary string.");
        };
        return subject.asObservable();
    }

    /**
     * This function is a helper function for generating certificate thumbprint based on input
     * data, certificate format and password. Now only support pfx and cer certificate thumbprint generation
     * @param data binary string of uploaded file
     * @param format certificate type. Ex. cer or pfx
     * @param password only specify password when format is pfx
     */
    private _generateThumbprint(data: string, format: CertificateFormat, password?: string): string {
        let certDer: string = null;
        switch (format) {
            case CertificateFormat.pfx:
                const p12Der = forge.util.decode64(data);
                const p12Asn1 = forge.asn1.fromDer(p12Der);
                const outCert = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
                const keyBags = outCert.getBags({ bagType: forge.pki.oids.certBag });
                const bag = keyBags[forge.pki.oids.certBag][0];
                const certAsn1 = forge.pki.certificateToAsn1(bag.cert);
                certDer = forge.asn1.toDer(certAsn1).getBytes();
                break;
            case CertificateFormat.cer:
                const outAsn1 = forge.asn1.fromDer(data);
                certDer = forge.asn1.toDer(outAsn1).getBytes();
                break;
            default:
                throw new Error(`Supported certificate type are CER and PFX,
                    current certificate type is not supported.`);
        }
        const md = forge.md.sha1.create();
        md.start();
        md.update(certDer);
        const digest = md.digest();
        return digest.toHex();
    }
}
