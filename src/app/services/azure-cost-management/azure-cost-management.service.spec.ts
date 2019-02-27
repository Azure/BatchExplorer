import { ArmBatchAccount, ArmSubscription } from "app/models";
import { BehaviorSubject, of } from "rxjs";
import { AzureCostManagementService } from "./azure-cost-management.service";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

fdescribe("UsageDetailsService", () => {
    let service: AzureCostManagementService;
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
            post: jasmine.createSpy("azure.post").and.callFake((sub, uri) => {
                return of({
                    id: "query/query-1",
                    properties: {
                        columns: [
                            { name: "PreTaxCost" },
                            { name: "UsageDate" },
                            { name: "MeterCategory" },
                            { name: "MeterSubCategory" },
                            { name: "Currency" },
                        ],
                        rows: [
                            [1, 20190201, "virtual machines", "a series", "USD"],
                            [79, 20190201, "virtual machines", "d series", "USD"],
                            [1.5, 20190202, "virtual machines", "a series", "USD"],
                            [12, 20190202, "virtual machines", "d series", "USD"],
                            [8, 20190203, "virtual machines", "a series", "USD"],
                            [39, 20190203, "virtual machines", "d series", "USD"],
                            [3.8, 20190204, "virtual machines", "a series", "USD"],
                            [27, 20190204, "virtual machines", "d series", "USD"],
                        ],
                    },
                });
            }),
        };

        service = new AzureCostManagementService(accountServiceSpy, azureHttpSpy);
    });

    it("get the usage for the current account", async () => {
        const usages = await service.getCost().toPromise();
        expect(azureHttpSpy.post).toHaveBeenCalledTimes(1);
        expect(azureHttpSpy.post).toHaveBeenCalledWith(sub1,
            "subscriptions/sub1/providers/Microsoft.CostManagement/query",
            jasmine.anything());
        expect(usages).toEqual([
            { preTaxCost: 1, date: new Date(2019, 1, 1), meter: "virtual machines (a series)", currency: "USD" },
            { preTaxCost: 79, date: new Date(2019, 1, 1), meter: "virtual machines (d series)", currency: "USD" },
            { preTaxCost: 1.5, date: new Date(2019, 1, 2), meter: "virtual machines (a series)", currency: "USD" },
            { preTaxCost: 12, date: new Date(2019, 1, 2), meter: "virtual machines (d series)", currency: "USD" },
            { preTaxCost: 8, date: new Date(2019, 1, 3), meter: "virtual machines (a series)", currency: "USD" },
            { preTaxCost: 39, date: new Date(2019, 1, 3), meter: "virtual machines (d series)", currency: "USD" },
            { preTaxCost: 3.8, date: new Date(2019, 1, 4), meter: "virtual machines (a series)", currency: "USD" },
            { preTaxCost: 27, date: new Date(2019, 1, 4), meter: "virtual machines (d series)", currency: "USD" },
        ]);
    });
});
