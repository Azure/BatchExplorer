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
