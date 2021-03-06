import { Certificate, hasCertificateAttributes } from "../models/certificate";
import { AbstractHttpService } from "../http-service";

export const defaultThumbprintAlgorithm = "sha1";

export class CertificateService extends AbstractHttpService {
    async get(
        thumbprint: string,
        thumbprintAlgorithm: string = defaultThumbprintAlgorithm
    ): Promise<Certificate | null> {
        // TODO: Replace hard-coded URL
        const result = await this.httpClient.get(
            `https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=${encodeURIComponent(
                thumbprintAlgorithm
            )},thumbprint=${encodeURIComponent(
                thumbprint
            )})?api-version=2020-09-01.12.0`
        );

        // Early out or error
        if (!result.ok) {
            if (result.status === 404) {
                return null;
            }
            // TODO: Add proper error handling for HTTP errors (this should live
            //       in the common package)
            throw new Error(
                "Unable to retreive certificate. HTTP status " + result.status
            );
        }

        const json = await result.json();

        // Validate response
        if (!hasCertificateAttributes(json)) {
            throw new Error(
                "Malformed response: " + JSON.stringify(json, null, 4)
            );
        }

        return new Certificate(json);
    }
}
