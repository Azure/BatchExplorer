import { ArmBatchAccount, Subscription } from "app/models";
import { List } from "immutable";
import { of } from "rxjs";
import { ArmBatchAccountService } from "./arm-batch-account.service";

const sub1 = new Subscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});
const sub2 = new Subscription({
    id: "/subscriptions/sub2",
    subscriptionId: "sub2",
});

const subs = {
    [sub1.subscriptionId]: sub1,
    [sub2.subscriptionId]: sub2,
};

describe("ArmBatchAccountService", () => {
    let service: ArmBatchAccountService;
    let httpSpy;
    let subscriptionServiceSpy;
    let accounts: ArmBatchAccount[];

    beforeEach((done) => {
        httpSpy = {
            get: jasmine.createSpy("any").and.callFake((subscription, url) => {
                return of({
                    value: [{
                        id: `${subscription.id}/some-account-1`,
                        name: "some-account-1",
                    }],
                });
            }),
        };

        subscriptionServiceSpy = {
            subscriptions: of(List([sub1, sub2])),
            get: (subId) => of(subs[subId]),
        };
        service = new ArmBatchAccountService(httpSpy, subscriptionServiceSpy);
        service.accounts.subscribe(x => accounts = x.toArray());
        service.load().subscribe(() => {
            done();
        });
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("should have loaded the list of accounts from all subscriptions", () => {
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        expect(httpSpy.get).toHaveBeenCalledWith(sub1,
            "/subscriptions/sub1/providers/Microsoft.Batch/batchAccounts", jasmine.anything());
        expect(httpSpy.get).toHaveBeenCalledWith(sub2,
            "/subscriptions/sub2/providers/Microsoft.Batch/batchAccounts", jasmine.anything());
    });

    it("when it loads accounts it insert the subscription inside", () => {
        expect(accounts.length).toBe(2);
        expect(accounts[0].id).toEqual("/subscriptions/sub1/some-account-1");
        expect(accounts[0].subscription).toEqual(sub1);
        expect(accounts[1].id).toEqual("/subscriptions/sub2/some-account-1");
        expect(accounts[1].subscription).toEqual(sub2);
    });
});
