import {
    AbstractHttpService,
    HttpListResult,
    HttpResult,
} from "../http-service";
import { Certificate } from "./certificate-models";
import {
    parseCertificateJson,
    parseCertificateListJson,
} from "./certificate-util";

export const defaultThumbprintAlgorithm = "sha1";

export class CertificateService extends AbstractHttpService {
    async get(
        thumbprint: string,
        thumbprintAlgorithm: string = defaultThumbprintAlgorithm
    ): Promise<HttpResult<Certificate>> {
        // TODO: Replace hard-coded URL
        const response = await this.httpClient.get(
            `https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=${encodeURIComponent(
                thumbprintAlgorithm
            )},thumbprint=${encodeURIComponent(
                thumbprint
            )})?api-version=2020-09-01.12.0`
        );

        if (!response.ok) {
            // Bad or missing
            // TODO: Add better/more standardized error handling
            if (response.status > 500) {
                console.error(
                    `${
                        response.status
                    } error getting certificate. Response body: ${await response.text()}`
                );
            }
            return new HttpResult(response);
        }

        const text = await response.text();

        let cert: Certificate;
        try {
            cert = parseCertificateJson(text);
        } catch (e) {
            throw new Error("Malformed response: " + text);
        }

        return new HttpResult(response, cert);
    }

    /**
     * List all certificates in the service
     * @returns A certificate list result
     */
    async listAll(): Promise<HttpListResult<Certificate>> {
        // TODO: Replace hard-coded URL
        const response = await this.httpClient.get(
            `https://prodtest1.brazilsouth.batch.azure.com/certificates?api-version=2020-09-01.12.0`
        );

        if (!response.ok) {
            // Bad or missing
            // TODO: Add better/more standardized error handling
            if (response.status > 500) {
                console.error(
                    `${
                        response.status
                    } error getting certificate list. Response body: ${await response.text()}`
                );
            }
            return new HttpListResult(response);
        }

        const text = await response.text();

        let certs: Certificate[];
        try {
            certs = parseCertificateListJson(text);
        } catch (e) {
            throw new Error("Malformed response: " + text);
        }

        return new HttpListResult(response, certs);
    }
}
