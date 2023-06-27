import { HttpParams } from "@angular/common/http";
import { HttpRequestOptions } from "@batch-flask/core";
import { BatchSharedKeyAuthenticator } from "./batch-shared-key-authenticator";

const testDate = new Date("2018-10-05T09:05:06.000Z");

describe("BatchSharedKeyAuthenticator", () => {
    let authenticator: BatchSharedKeyAuthenticator;

    beforeEach(() => {
        authenticator = new BatchSharedKeyAuthenticator("testaccount", "somekey");
        jasmine.clock().mockDate(testDate);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    function getHeaders(request): StringMap<string> {
        const keys = request.headers.keys();

        const obj = {};
        for (const key of keys) {
            obj[key] = request.headers.get(key);
        }
        return obj;
    }

    it("sign simple GET request correctly", async () => {
        const request: HttpRequestOptions = {

        };
        await authenticator.signRequest("get", "https://testaccount.westus2.batch.azure.com", request);

        expect(request.headers).not.toBeFalsy();
        expect(getHeaders(request)).toEqual({
            "ocp-date": "Fri, 05 Oct 2018 09:05:06 GMT",
            "Authorization": "SharedKey testaccount:JicngYEjSUNCXiXY9NCLQnOX9lQsaKXEamO4aL+UNjY=",
        });
    });

    it("sign GET request with query parameters correctly", async () => {
        const request: HttpRequestOptions = {
            params: new HttpParams().set("api-version", "2018-08-01"),
        };
        await authenticator.signRequest("get", "https://testaccount.westus2.batch.azure.com", request);

        expect(request.headers).not.toBeFalsy();
        expect(getHeaders(request)).toEqual({
            "ocp-date": "Fri, 05 Oct 2018 09:05:06 GMT",
            "Authorization": "SharedKey testaccount:d6XpT6+i15AMviEHZJxmSvH6KMkrHwI/k9+z+xmJxPc=",
        });
    });

    it("sign GET request with query parameters already in url correctly", async () => {
        const request: HttpRequestOptions = {
        };
        await authenticator.signRequest("get",
            "https://testaccount.westus2.batch.azure.com?api-version=2018-08-01", request);

        expect(request.headers).not.toBeFalsy();
        expect(getHeaders(request)).toEqual({
            "ocp-date": "Fri, 05 Oct 2018 09:05:06 GMT",
            "Authorization": "SharedKey testaccount:d6XpT6+i15AMviEHZJxmSvH6KMkrHwI/k9+z+xmJxPc=",
        });
    });

    it("sign simple POST request correctly with body", async () => {
        const request: HttpRequestOptions = {
            body: JSON.stringify({ id: "some" }),
        };
        await authenticator.signRequest("post", "/pools", request);

        expect(request.headers).not.toBeFalsy();
        expect(getHeaders(request)).toEqual({
            "ocp-date": "Fri, 05 Oct 2018 09:05:06 GMT",
            "Authorization": "SharedKey testaccount:GgI/PPSZVqHRx3U4A+QbkXY0FdMv/2bUzxfBI5c2x+s=",
        });
    });

    it("sign simple POST request correctly with as object", async () => {
        const request: HttpRequestOptions = {
            body: { id: "some" },
        };
        await authenticator.signRequest("post", "/pools", request);

        expect(request.headers).not.toBeFalsy();
        expect(getHeaders(request)).toEqual({
            "ocp-date": "Fri, 05 Oct 2018 09:05:06 GMT",
            "Authorization": "SharedKey testaccount:GgI/PPSZVqHRx3U4A+QbkXY0FdMv/2bUzxfBI5c2x+s=",
        });
    });
});
