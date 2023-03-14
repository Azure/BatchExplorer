import {
    initMockEnvironment,
    getMockEnvironment,
} from "@batch/ui-common/lib/environment";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { Endpoints, ApiVersion } from "../../constants";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { LiveLocationService } from "../live-location-service";
import { LocationService } from "../location-service";

describe("LiveLocationService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";

    let service: LocationService;
    let fakeSet: FakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveLocationService();
        fakeSet = new BasicFakeSet();
    });

    test("List by subscription", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}/subscriptions/00000000-0000-0000-0000-000000000000/locations?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listLocationsBySubscription(tanukiSubId),
                    }),
                }
            )
        );

        // Subscription ID
        let locations = await service.listBySubscriptionId(tanukiSubId);
        expect(locations.length).toBe(2);
        expect(locations.map((location) => location.name)).toEqual([
            "eastus",
            "southcentralus",
        ]);

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}/subscriptions/00000000-0000-0000-0000-000000000000/locations?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listLocationsBySubscription(tanukiSubId),
                    }),
                }
            )
        );

        // Full ARM ID
        locations = await service.listBySubscriptionId(
            `/subscriptions/${tanukiSubId}`
        );
        expect(locations.length).toBe(2);
        expect(locations.map((location) => location.name)).toEqual([
            "eastus",
            "southcentralus",
        ]);
    });

    test("List by subscription error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}/subscriptions/00000000-0000-0000-0000-000000000000/locations?api-version=${ApiVersion.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() =>
            service.listBySubscriptionId(tanukiSubId)
        ).rejects.toThrowError(
            `Failed to list locations under subscription ${tanukiSubId} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });

    test("Get by resource ID success", async () => {
        const eastUSId = `/subscriptions/${tanukiSubId}/locations/eastus`;

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${eastUSId}?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(fakeSet.locations[eastUSId]),
                }
            )
        );

        const location = await service.get(eastUSId);
        expect(location?.name).toEqual("eastus");
    });

    test("Get by resource ID not found", async () => {
        const notFoundLocation = `/subscriptions/${tanukiSubId}/locations/doesntexist`;

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${notFoundLocation}?api-version=${ApiVersion.arm}`,
                {
                    status: 404,
                }
            )
        );

        const location = await service.get(notFoundLocation);
        expect(location).toBeUndefined();
    });

    test("Get by resource ID error", async () => {
        const badLocation = `/subscriptions/${tanukiSubId}/locations/barf`;

        httpClient.addExpected(
            new MockHttpResponse(
                `${Endpoints.arm}${badLocation}?api-version=${ApiVersion.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() => service.get(badLocation)).rejects.toThrowError(
            `Failed to get location ${badLocation} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });
});
