import { fromIso } from "@batch/ui-common";
import { Certificate } from "./certificate-models";

/**
 * Check if an abitrary object looks like a certificate
 *
 * @param obj The object to check
 *
 * @returns True if the object looks like a cert, false otherwise
 */
export function isCertificate(obj: unknown): obj is Certificate {
    if (obj && typeof obj === "object" && "thumbprint" in obj && "url" in obj) {
        return true;
    }
    return false;
}

/**
 * Parse a JSON string into a certificate model object
 *
 * @param json The JSON to parse
 *
 * @returns A new certificate model object
 */
export function parseCertificateJson(json: string): Certificate {
    const obj = JSON.parse(json);
    if (obj.stateTransitionTime) {
        obj.stateTransitionTime = fromIso(obj.stateTransitionTime);
    }
    if (obj.previousStateTransitionTime) {
        obj.previousStateTransitionTime = fromIso(
            obj.previousStateTransitionTime
        );
    }
    return obj;
}

/**
 * Serialize a certificate to a JSON string
 *
 * @param certificate The certificate to serialize
 *
 * @returns A formatted JSON string
 */
export function certificateToJson(certificate: Certificate): string {
    return JSON.stringify(certificate, null, 4);
}
