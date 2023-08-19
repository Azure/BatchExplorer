import { initMockEnvironment, getMockEnvironment } from "../../environment";
import { MockHttpClient, MockHttpResponse } from "../../http";
import { ApiVersion } from "../../constants";
import { BasicFakeSet, FakeSet } from "../../test-util/fakes";
import { LiveResourceGroupService } from "../live-resource-group-service";
import { ResourceGroupService } from "../resource-group-service";
import { getArmUrl } from "../../arm";

describe("LiveResourceGroupService", () => {
    const tanukiSubId = "00000000-0000-0000-0000-000000000000";
    const vizRgId =
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization";

    let service: ResourceGroupService;
    let fakeSet: FakeSet;

    let httpClient: MockHttpClient;

    beforeEach(() => {
        initMockEnvironment();
        httpClient = getMockEnvironment().getHttpClient();
        service = new LiveResourceGroupService();
        fakeSet = new BasicFakeSet();
    });

    test("List by subscription", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups?api-version=${
                    ApiVersion.arm
                }`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listResourceGroupsBySubscription(
                            tanukiSubId
                        ),
                    }),
                }
            )
        );

        // Subscription ID
        let resourceGroups = await service.listBySubscriptionId(tanukiSubId);
        expect(resourceGroups.length).toBe(2);
        expect(resourceGroups.map((rg) => rg.name)).toEqual([
            "supercomputing",
            "visualization",
        ]);

        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups?api-version=${
                    ApiVersion.arm
                }`,
                {
                    status: 200,
                    body: JSON.stringify({
                        value: fakeSet.listResourceGroupsBySubscription(
                            tanukiSubId
                        ),
                    }),
                }
            )
        );

        // Full ARM ID
        resourceGroups = await service.listBySubscriptionId(
            `/subscriptions/${tanukiSubId}`
        );
        expect(resourceGroups.length).toBe(2);
        expect(resourceGroups.map((rg) => rg.name)).toEqual([
            "supercomputing",
            "visualization",
        ]);
    });

    test("List by subscription error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups?api-version=${
                    ApiVersion.arm
                }`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() =>
            service.listBySubscriptionId(tanukiSubId)
        ).rejects.toThrowError(
            `Failed to list resource groups under subscription ${tanukiSubId} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });

    test("Get by resource ID success", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${vizRgId}?api-version=${ApiVersion.arm}`,
                {
                    status: 200,
                    body: JSON.stringify(fakeSet.getResourceGroup(vizRgId)),
                }
            )
        );

        const rg = await service.get(vizRgId);
        expect(rg?.name).toEqual("visualization");
    });

    test("Get by resource ID not found", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${vizRgId}?api-version=${ApiVersion.arm}`,
                {
                    status: 404,
                }
            )
        );

        const rg = await service.get(vizRgId);
        expect(rg).toBeUndefined();
    });

    test("Get by resource ID error", async () => {
        httpClient.addExpected(
            new MockHttpResponse(
                `${getArmUrl()}${vizRgId}?api-version=${ApiVersion.arm}`,
                {
                    status: 500,
                    body: "Boom",
                }
            )
        );

        expect(() => service.get(vizRgId)).rejects.toThrowError(
            `Failed to get resource group ${vizRgId} [unexpected 500 status]\nResponse body:\nBoom`
        );
    });
});
