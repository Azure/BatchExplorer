import {
    DependencyName,
    getMockEnvironment,
    initMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { CertificateService } from "../certificate-service";

describe("Certificate service", () => {
    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getInjectable(
            DependencyName.HttpClient
        );
    });

    test("Get cert", async () => {
        const service = new CertificateService();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)?api-version=2020-09-01.12.0",
                200,
                `{
                    "thumbprint": "bd7c0d29efad85c5174364c330db1698b14f7f55",
                    "thumbprintAlgorithm": "sha1",
                    "url": "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)",
                    "state": "active",
                    "stateTransitionTime": "2021-05-22T15:42:27.189Z",
                    "publicData": "MIICMTCCAZqgAwIBAgIQGroSHQekS6dHgBwHcOmihzANBgkqhkiG9w0BAQUFADBXMVUwUwYDVQQDHkwAewAxADAAQQBDADEAQQAzAEMALQBFADgAQgAwAC0ANABCADMANgAtADgAMAA0AEYALQBFADkARQBFAEEANwBGADQANgBEAEEAQQB9MB4XDTE2MDMwODAwMjcyM1oXDTE3MDMwODA2MjcyM1owVzFVMFMGA1UEAx5MAHsAMQAwAEEAQwAxAEEAMwBDAC0ARQA4AEIAMAAtADQAQgAzADYALQA4ADAANABGAC0ARQA5AEUARQBBADcARgA0ADYARABBAEEAfTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvUBbyvBVcVfL3eGBUQDBi6+LNYz5YCyxXZD22b0jKBvjwyY6tzvFPW/dZsSJ9ruwkc5YX4O9iS366z9ot3ZDcXP1jievVmT+ljFpBScrNDtHtw4NGSBYbb4JGqHPpvUMNbLDc+0pOBC2N2jS7umujAIt1RWuNi/rrgBiDkF3qrkCAwEAATANBgkqhkiG9w0BAQUFAAOBgQAnnTicnJhJpAsQbv72/7VfqI5OdUt9YkSo0FKCcDPYCDeZ3AaVfDENMHBgOsiCd8KyZx8pTqF6SzelF5W7pl6TEWuhCDCC9hCs8ecgsY38ZdixTEacQYYStmYsQ/PS1/4/J/40Dum5T4c76kv8r/dd1IAHjPdiNalFWOtSSu4NVA=="
                }`
            )
        );

        const view = await service.get(
            "bd7c0d29efad85c5174364c330db1698b14f7f55"
        );
        const cert = view.model;
        expect(cert?.thumbprint).toBe(
            "bd7c0d29efad85c5174364c330db1698b14f7f55"
        );
    });

    test("Get cert 404 not found", async () => {
        const service = new CertificateService();

        httpClient.addExpected(
            new MockHttpResponse(
                "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=does-not-exist)?api-version=2020-09-01.12.0",
                404
            )
        );

        const cert = await service.get("does-not-exist");
        expect(cert.response.status).toBe(404);
        expect(cert.model).toBeUndefined();
    });
});
