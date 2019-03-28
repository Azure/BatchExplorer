import { TimeRange } from "@batch-flask/ui";
import { ArmBatchAccount, ArmSubscription } from "app/models";
import { BehaviorSubject, of } from "rxjs";
import { AzureCostManagementService } from "./azure-cost-management.service";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const accountId = "/subscriptions/sub-1/resourcegroups/rg1/providers/Microsoft.Batch/batchaccounts/acc-1";
const pool1Id = `${accountId}/batchpools/pool1`;
const pool2Id = `${accountId}/batchpools/pool2`;

const day1 = new Date(2019, 1, 1);
const day2 = new Date(2019, 1, 2);
const day3 = new Date(2019, 1, 3);
const day4 = new Date(2019, 1, 4);
const day5 = new Date(2019, 1, 5);

describe("AzureCostManagementService", () => {
    let service: AzureCostManagementService;
    let accountServiceSpy;
    let azureHttpSpy;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: accountId,
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
                            { name: "ResourceId" },
                            { name: "Currency" },
                        ],
                        rows: [
                            [1, 20190201, pool1Id, "USD"],
                            [1.5, 20190202, pool1Id, "USD"],
                            [8, 20190203, pool1Id, "USD"],
                            [39, 20190203, pool2Id, "USD"],
                            [3.8, 20190204, pool1Id, "USD"],
                            [27, 20190204, pool2Id, "USD"],
                            [42, 20190205, pool2Id, "USD"],
                        ],
                    },
                });
            }),
        };

        service = new AzureCostManagementService(accountServiceSpy, azureHttpSpy);
    });

    it("get the usage for the current account", async () => {
        const usages = await service.getCost(new TimeRange({ start: day1, end: day4 })).toPromise();
        expect(azureHttpSpy.post).toHaveBeenCalledTimes(1);
        expect(azureHttpSpy.post).toHaveBeenCalledWith(sub1,
            "/subscriptions/sub-1/resourceGroups/rg1/providers/Microsoft.CostManagement/query",
            jasmine.anything());
        expect(usages).toEqual({
            currency: "USD",
            totalForPeriod: 122.3,
            pools: {
                pool1: {
                    totalForPeriod: 14.3,
                    costs: [
                        { preTaxCost: 1, date: day1 },
                        { preTaxCost: 1.5, date: day2 },
                        { preTaxCost: 8, date: day3 },
                        { preTaxCost: 3.8, date: day4 },
                        { preTaxCost: 0, date: day5 },
                    ],
                },
                pool2: {
                    totalForPeriod: 108,
                    costs: [
                        { preTaxCost: 0, date: day1 },
                        { preTaxCost: 0, date: day2 },
                        { preTaxCost: 39, date: day3 },
                        { preTaxCost: 27, date: day4 },
                        { preTaxCost: 42, date: day5 },
                    ],
                },
            },
        });
    });
});
