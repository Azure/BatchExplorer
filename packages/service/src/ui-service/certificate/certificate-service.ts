import {
    AbstractHttpService,
    HttpListResult,
    HttpResult,
} from "../http-service";
import { isCertificate } from "./certificate-util";
import { Certificate } from "./certificate-models";
import { isODataListJson } from "../odata";

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

        const json = await response.json();

        // Validate response
        if (!isCertificate(json)) {
            throw new Error(
                "Malformed response: " + JSON.stringify(json, null, 4)
            );
        }

        return new HttpResult(response, json);
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

        const json = await response.json();

        // Validate list result
        if (!isODataListJson<Certificate>(json)) {
            throw new Error(
                "Malformed response: " + JSON.stringify(json, null, 4)
            );
        }

        // Validate certs
        for (const obj of json.value) {
            if (!isCertificate(obj)) {
                throw new Error(
                    "Malformed certificate in response: " +
                        JSON.stringify(obj, null, 4)
                );
            }
        }

        return new HttpListResult(response, json.value);
    }
}
