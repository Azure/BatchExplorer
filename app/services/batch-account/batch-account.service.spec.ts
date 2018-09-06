import {
    ArmBatchAccount,
    BatchAccount,
    BatchAccountProvisingState,
    LocalBatchAccount,
    Subscription as ArmSubscription,
} from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Subscription, of } from "rxjs";
import { BatchAccountService } from "./batch-account.service";

const sub = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const armAccount1 = new ArmBatchAccount({
    id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1",
    name: "arm-account-1",
    properties: {
        accountEndpoint: "arm-account-1.eastus.batch.azure.com",
        provisioningState: BatchAccountProvisingState.Succeeded,
        dedicatedCoreQuota: 20,
        lowPriorityCoreQuota: 50,
    } as any,
    location: "eastus",
    subscription: sub,
});
const armAccount2 = new ArmBatchAccount({
    id: "/subscriptions/sub1/resources/batch-accounts/arm-account-2",
    name: "arm-account-2",
    properties: {
        accountEndpoint: "arm-account-2.westus2.batch.azure.com",
        provisioningState: BatchAccountProvisingState.Succeeded,
        dedicatedCoreQuota: 20,
        lowPriorityCoreQuota: 50,
    } as any,
    location: "westus2",
    subscription: sub,
});

const localAccount1 = new LocalBatchAccount({
    displayName: "Foo",
    name: "testaccount1",
    key: "somekey==",
    url: "https://testaccount1.westus2.batch.azure.com",
});

const localAccount2 = new LocalBatchAccount({
    displayName: "Bar",
    name: "testaccount2",
    key: "somekey==",
    url: "https://testaccount2.westus2.batch.azure.com",
});

describe("BatchAccountService", () => {
    let service: BatchAccountService;
    let armAccountSpy;
    let localAccountSpy;
    let subscriptionServiceSpy;
    let accounts: BatchAccount[];
    let subs: Subscription[];

    beforeEach(() => {
        subs = [];
        armAccountSpy = {
            accounts: new BehaviorSubject(List([armAccount1, armAccount2])),
            get: jasmine.createSpy("armGet").and.returnValue(of(armAccount2)),
        };
        localAccountSpy = {
            accounts: new BehaviorSubject(List([localAccount1, localAccount2])),
            get: jasmine.createSpy("localGet").and.returnValue(of(localAccount1)),
        };

        subscriptionServiceSpy = {
            subscriptions: of(List([sub])),
            get: () => of(sub),
        };
        service = new BatchAccountService(armAccountSpy, localAccountSpy, null, null, subscriptionServiceSpy);
        subs.push(service.accounts.subscribe(x => accounts = x.toArray()));
    });

    afterEach(() => {
        service.ngOnDestroy();
        subs.forEach(x => x.unsubscribe());
    });

    it("Combines the accounts from arm and local sources", () => {
        expect(accounts).toEqual([
            localAccount1,
            localAccount2,
            armAccount1,
            armAccount2,
        ]);
    });

    it("get accounts from local source if id is local id", async () => {
        const account = await service.get("local/https://testaccount1.westus2.batch.azure.com").toPromise();
        expect(localAccountSpy.get).toHaveBeenCalledOnce();
        expect(localAccountSpy.get).toHaveBeenCalledWith("local/https://testaccount1.westus2.batch.azure.com");
        expect(account).toEqual(localAccount1);
    });

    it("get account from cache shouldn't call the local source againd", async () => {
        await service.get("local/https://testaccount1.westus2.batch.azure.com").toPromise();
        expect(localAccountSpy.get).toHaveBeenCalledTimes(1);
        const account = await service.getFromCache("local/https://testaccount1.westus2.batch.azure.com").toPromise();
        expect(localAccountSpy.get).toHaveBeenCalledTimes(1);
        expect(account).toEqual(localAccount1);
    });

    it("get accounts from arm source if id is arm id", async () => {
        const account = await service.get("/subscriptions/sub1/resources/batch-accounts/arm-account-2").toPromise();
        expect(armAccountSpy.get).toHaveBeenCalledOnce();
        expect(armAccountSpy.get).toHaveBeenCalledWith("/subscriptions/sub1/resources/batch-accounts/arm-account-2");
        expect(account).toEqual(armAccount2);
    });
});
