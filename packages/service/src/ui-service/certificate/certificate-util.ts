import { fromIso, isArray } from "@batch/ui-common";
import { toODataList } from "../odata";
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
 * Parse a JSON string into a certificate
 *
 * @param json The JSON to parse
 *
 * @returns A new certificates
 */
export function parseCertificateJson(json: string | unknown): Certificate {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
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

/**
 * Parse a JSON string into a list of certificates
 *
 * @param json The JSON to parse
 *
 * @returns A new list of certificates
 */
export function parseCertificateListJson(
    json: string | unknown[]
): Certificate[] {
    let jsonList;
    if (typeof json === "string") {
        const parsed = JSON.parse(json);
        if (!parsed.value) {
            throw new Error("Malformed list JSON: No property named 'value'");
        }
        jsonList = parsed.value;
    } else {
        jsonList = json;
    }

    if (!isArray(jsonList)) {
        throw new Error("Failed to parse: string must be a JSON list");
    }

    const certs: Certificate[] = [];
    for (const obj of jsonList) {
        if (obj && obj instanceof Object) {
            certs.push(parseCertificateJson(obj));
        } else {
            console.warn(
                "Skipping malformed certificate list item: " + String(obj)
            );
        }
    }

    return certs;
}

/**
 * Serialize a list of certificates to a JSON string
 *
 * @param certificate The certificates to serialize
 *
 * @returns A formatted JSON string
 */
export function certificateListToJson(certificates: Certificate[]): string {
    return JSON.stringify(toODataList(certificates), null, 4);
}
