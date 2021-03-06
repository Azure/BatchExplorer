import { ServerError } from "@batch-flask/core";
import { ArmBatchAccount, ArmSubscription } from "app/models";
import { BehaviorSubject, of, throwError } from "rxjs";
import { UsageDetail, UsageDetailsService, UsageDetailsUnsupportedSubscription } from "./usage-details.service";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const internalSub = new ArmSubscription({
    id: "/subscriptions/internal-1",
    subscriptionId: "internal-1",
});

const usage1: UsageDetail = {
    id: "usages/use-1",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 0.5,
    } as any,
};

const usage2: UsageDetail = {
    id: "usages/use-2",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 3.8,
    } as any,
};

const usage3: UsageDetail = {
    id: "usages/use-3",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 9.1,
    } as any,
};

describe("UsageDetailsService", () => {
    let service: UsageDetailsService;
    let accountServiceSpy;
    let azureHttpSpy;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: "/subs/sub-1/batchaccounts/acc-1",
                name: "acc-1",
                location: "westus",
                properties: {} as any,
                subscription: sub1,
            })),
        };

        azureHttpSpy = {
            get: jasmine.createSpy("azure.get").and.callFake((sub, uri) => {
                if (sub === internalSub) {
                    return throwError(new ServerError({ status: 422, statusText: "Unsupported subscription" } as any));
                }
                if (uri === "foo") {
                    return of({
                        value: [usage3],
                    });
                }
                return of({
                    value: [usage1, usage2],
                    nextLink: "foo",
                });
            }),
        };

        service = new UsageDetailsService(accountServiceSpy, azureHttpSpy);
    });

    it("get the usage for the current account", async () => {
        const usages = await service.getUsage().toPromise();
        expect(azureHttpSpy.get).toHaveBeenCalledTimes(2);
        expect(azureHttpSpy.get).toHaveBeenCalledWith(sub1,
            "subscriptions/sub1/providers/Microsoft.Consumption/usageDetails",
            jasmine.anything());
        expect(azureHttpSpy.get).toHaveBeenCalledWith(sub1, "foo", jasmine.anything());
        expect(usages).toEqual([usage1, usage2, usage3]);
    });

    it("throws an UsageDetailsUnsupportedSubscription when subscription is internal", async () => {
        accountServiceSpy.currentAccount.next(new ArmBatchAccount({
            id: "/subs/sub-1/batchaccounts/acc-2",
            name: "acc-2",
            location: "westus",
            properties: {} as any,
            subscription: internalSub,
        }));
        try {
            await service.getUsage().toPromise();
            fail("Should have raised error");
        } catch (e) {
            expect(e instanceof UsageDetailsUnsupportedSubscription).toBe(true);
            expect(azureHttpSpy.get).toHaveBeenCalledTimes(1);
            expect(azureHttpSpy.get).toHaveBeenCalledWith(internalSub,
                "subscriptions/internal-1/providers/Microsoft.Consumption/usageDetails",
                jasmine.anything());
        }
    });
});
