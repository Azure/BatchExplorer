import { Injectable } from "@angular/core";
import {
    ContinuationToken,
    DataCache,
    EntityView,
    ListOptionsAttributes,
    ListResponse,
    ListView,
} from "@batch-flask/core";
import { FileUrlUtils, SanitizedError } from "@batch-flask/utils";
import { Certificate } from "app/models";
import { Constants } from "common";
import { List } from "immutable";
import * as forge from "node-forge";
import { AsyncSubject, Observable, Subject } from "rxjs";
import { AzureBatchHttpService, BatchEntityGetter, BatchListGetter } from "../core";

export interface CertificateListParams {
}

export interface CertificateParams {
    thumbprint?: string;
    thumbprintAlgorithm?: string;
}

export type CertificateListOptions = ListOptionsAttributes;

export interface NewCertificateDto {
    password: string;
    certificateFormat: string;
    thumbprintAlgorithm: string;
    thumbprint: string;
    data: string;
}

export const defaultThumbprintAlgorithm = "sha1";

export enum CertificateFormat {
    pfx = "pfx",
    cer = "cer",
}

export class InvalidCertificateFormatError extends SanitizedError {
    constructor(message: string) {
        super(message);
    }
}

@Injectable({providedIn: "root"})
export class CertificateService {
    /**
     * Triggered only when a certificate is added through this app.
     * Used to notify the list of a new item
     */
    public onCertificateAdded = new Subject<string>();
    public cache = new DataCache<Certificate>();

    private _basicProperties: string = "thumbprint,thumbprintAlgorithm,state,stateTransitionTime";
    private _getter: BatchEntityGetter<Certificate, CertificateParams>;
    private _listGetter: BatchListGetter<Certificate, CertificateListParams>;

    constructor(private http: AzureBatchHttpService) {

        this._getter = new BatchEntityGetter(Certificate, this.http, {
            cache: () => this.cache,
            uri: (params: CertificateParams) => {
                return this._thumprintUrl(params.thumbprint, params.thumbprintAlgorithm);
            },
        });

        this._listGetter = new BatchListGetter(Certificate, this.http, {
            cache: () => this.cache,
            uri: () => `/certificates`,
        });
    }

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options?: any, forceNew?: boolean): Observable<ListResponse<Certificate>>;
    public list(nextLink: ContinuationToken): Observable<ListResponse<Certificate>>;
    public list(nextLinkOrOptions: any, options = {}, forceNew = false): Observable<ListResponse<Certificate>> {
        if (nextLinkOrOptions && nextLinkOrOptions.nextLink) {
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

    public getFromCache(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string): Observable<Certificate> {
        const algorithm = thumbprintAlgorithm || defaultThumbprintAlgorithm;
        return this._getter.fetch({ thumbprintAlgorithm: algorithm, thumbprint: thumbprint }, { cached: true });
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
        return this.http.delete(this._thumprintUrl(thumbprint, thumbprintAlgorithm));
    }

    public add(certificate: any, options: any = {}): Observable<{}> {
        return this.http.post(`/certificates`, certificate);
    }

    public cancelDelete(thumbprint: string, options: any = {}, thumbprintAlgorithm?: string) {
        return this.http.post(`${this._thumprintUrl(thumbprint, thumbprintAlgorithm)}/canceldelete`, null);
    }

    /**
     * parseCertificate helps to parse uploaded certificate and return parameters which can be
     * used to create batch certificate
     * @param file uploaded certificate
     * @param password password for pfx certifcate
     */
    public parseCertificate(file: File, password: string): Observable<NewCertificateDto> {
        const subject = new AsyncSubject<NewCertificateDto>();
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => {
            // try catch potential error when get thumbprint
            try {
                const certificateFormat = FileUrlUtils.getFileExtension(file.name);
                const binaryEncodedData = reader.result as any;
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
                throw new InvalidCertificateFormatError(`Supported certificate type are CER and PFX,
                    current certificate type is not supported.`);
        }
        const md = forge.md.sha1.create();
        md.start();
        md.update(certDer);
        const digest = md.digest();
        return digest.toHex();
    }

    private _thumprintUrl(thumbprint: string, algorithm?: string) {
        algorithm = algorithm || defaultThumbprintAlgorithm;
        return `/certificates(thumbprintAlgorithm=${algorithm},thumbprint=${thumbprint})`;
    }
}
