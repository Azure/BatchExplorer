export interface NameValuePair {
    name: string;
    value?: string;
}

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
    previousState?: CertificateState;
    previousStateTransitionTime?: Date;
    deleteCertificateError?: DeleteCertificateError;
}

export type CertificateState = "active" | "deletefailed" | "deleting";

/**
 * Check if an abitrary object looks like a certificate
 *
 * @param obj The object to check
 *
 * @returns True if the object looks like a cert, false otherwise
 */
export function hasCertificateAttributes(
    obj: unknown
): obj is CertificateAttributes {
    if (obj && typeof obj === "object" && "thumbprint" in obj && "url" in obj) {
        return true;
    }
    return false;
}

export class Certificate implements CertificateAttributes {
    url: string;
    thumbprint: string;
    thumbprintAlgorithm: string;
    publicData: string;
    state: CertificateState;
    stateTransitionTime: Date;
    previousState?: CertificateState;
    previousStateTransitionTime?: Date;
    deleteCertificateError?: DeleteCertificateError;

    /**
     * If the certificate can be cancelled a failed deletion
     * i.e. A active and deleting certificate cannot be reactived.
     */
    public readonly reactivable: boolean;

    constructor(data: CertificateAttributes) {
        this.url = data.url;
        this.thumbprint = data.thumbprint;
        this.thumbprintAlgorithm = data.thumbprintAlgorithm;
        this.publicData = data.publicData;
        this.state = data.state;
        this.stateTransitionTime = data.stateTransitionTime;
        this.previousState = data.previousState;
        this.previousStateTransitionTime = data.previousStateTransitionTime;
        this.deleteCertificateError = data.deleteCertificateError;
        this.reactivable = this.state === "deletefailed";
    }

    // There is no id field in certificate, we need mock an id field for
    // pin/unpin favorite function passing NavigableRecord
    public get id(): string {
        return this.thumbprint;
    }

    public get name(): string {
        return this.thumbprint;
    }

    public get uid(): string {
        return this.url;
    }
}
