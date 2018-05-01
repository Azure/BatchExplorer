import { Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { NameValuePair } from ".";

export interface DeleteCertificateError {
    code: string;
    message: string;
    values: NameValuePair[];
}

export interface CertificateAttributes {
    url: string;
    thumbprint: string;
    thumbprintAlgorithm: string;
    publicData: string;
    state: CertificateState;
    stateTransitionTime: Date;
    previousState: CertificateState;
    previousStateTransitionTime: Date;
    deleteCertificateError: DeleteCertificateError;
}
/**
 * Class for displaying Batch certificate information.
 */
@Model()
export class Certificate extends Record<CertificateAttributes> implements NavigableRecord {
    @Prop() public url: string;
    @Prop() public thumbprint: string;
    @Prop() public thumbprintAlgorithm: string;
    @Prop() public publicData: string;
    @Prop() public state: CertificateState;
    @Prop() public stateTransitionTime: Date;
    @Prop() public previousState: CertificateState;
    @Prop() public previousStateTransitionTime: Date;
    @Prop() public deleteCertificateError: DeleteCertificateError;

    /**
     * If the certificate can be cancelled a failed deletion
     * i.e. A active and deleting certificate cannot be reactived.
     */
    public readonly reactivable: boolean;

    constructor(data: Partial<CertificateAttributes> = {}) {
        super(data);
        this.reactivable = this.state === CertificateState.deletefailed;
    }

    // There is no id field in certificate, we need mock an id field for
    // pin/unpin favorite function passing NavigableRecord
    public get id(): string {
        return this.thumbprint;
    }

    public get name(): string {
        return this.thumbprint;
    }

    public get routerLink(): string[] {
        return ["/certificates", this.thumbprint];
    }
}

export enum CertificateState {
    active = "active",
    deletefailed = "deletefailed",
    deleting = "deleting",
}
