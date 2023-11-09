//
// KLUGE: The types/interfaces below are copy/pasted straight from
//        generated code. These should be replaced if/when we import the
//        Batch JS SDK directly

/** Defines values for CertificateFormat. */
export type CertificateFormat = "pfx" | "cer";
/** Defines values for CertificateState. */
export type CertificateState = "active" | "deleting" | "deletefailed";

/** A Certificate that can be installed on Compute Nodes and can be used to authenticate operations on the machine. */
export interface CertificateAddParameter {
    /** The X.509 thumbprint of the Certificate. This is a sequence of up to 40 hex digits (it may include spaces but these are removed). */
    thumbprint: string;
    /** The algorithm used to derive the thumbprint. This must be sha1. */
    thumbprintAlgorithm: string;
    /** The base64-encoded contents of the Certificate. The maximum size is 10KB. */
    data: string;
    /** The format of the Certificate data. */
    certificateFormat?: CertificateFormat;
    /** This must be omitted if the Certificate format is cer. */
    password?: string;
}

/** The result of listing the Certificates in the Account. */
export interface CertificateListResult {
    /** The list of Certificates. */
    value?: Certificate[];
    /** The URL to get the next set of results. */
    odataNextLink?: string;
}

/** A Certificate that can be installed on Compute Nodes and can be used to authenticate operations on the machine. */
export interface Certificate {
    /** The X.509 thumbprint of the Certificate. This is a sequence of up to 40 hex digits. */
    thumbprint?: string;
    /** The algorithm used to derive the thumbprint. */
    thumbprintAlgorithm?: string;
    /** The URL of the Certificate. */
    url?: string;
    /** The state of the Certificate. */
    state?: CertificateState;
    /** The time at which the Certificate entered its current state. */
    stateTransitionTime?: Date;
    /** This property is not set if the Certificate is in its initial active state. */
    previousState?: CertificateState;
    /** This property is not set if the Certificate is in its initial Active state. */
    previousStateTransitionTime?: Date;
    /** The public part of the Certificate as a base-64 encoded .cer file. */
    publicData?: string;
    /** This property is set only if the Certificate is in the DeleteFailed state. */
    deleteCertificateError?: DeleteCertificateError;
}

/** An error encountered by the Batch service when deleting a Certificate. */
export interface DeleteCertificateError {
    /** An identifier for the Certificate deletion error. Codes are invariant and are intended to be consumed programmatically. */
    code?: string;
    /** A message describing the Certificate deletion error, intended to be suitable for display in a user interface. */
    message?: string;
    /** This list includes details such as the active Pools and Compute Nodes referencing this Certificate. However, if a large number of resources reference the Certificate, the list contains only about the first hundred. */
    values?: NameValuePair[];
}

/** Represents a name-value pair. */
export interface NameValuePair {
    /** The name in the name-value pair. */
    name?: string;
    /** The value in the name-value pair. */
    value?: string;
}

/** The result of listing the Certificates in the Account. */
export interface CertificateListResult {
    /** The list of Certificates. */
    value?: Certificate[];
    /** The URL to get the next set of results. */
    odataNextLink?: string;
}
