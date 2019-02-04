import { ServerError } from "@batch-flask/core";
import {
    ArmBatchAccount,
    BatchAccount,
    BatchAccountProvisingState,
    LocalBatchAccount,
    Subscription as ArmSubscription,
} from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Subscription, of, throwError } from "rxjs";
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

const armAccounts = {
    [armAccount1.id]: armAccount1,
    [armAccount2.id]: armAccount2,
};

const localAccounts = {
    [localAccount1.id]: localAccount1,
    [localAccount2.id]: localAccount2,
};

describe("BatchAccountService", () => {
    let service: BatchAccountService;
    let armAccountSpy;
    let localAccountSpy;
    let subscriptionServiceSpy;
    let userSpecificStoreSpy;
    let accounts: BatchAccount[];
    let subs: Subscription[];
    let favoritesSavedData: BehaviorSubject<any[]>;

    beforeEach(() => {
        subs = [];
        favoritesSavedData = new BehaviorSubject<any[]>([]);
        armAccountSpy = {
            accounts: new BehaviorSubject(List([armAccount1, armAccount2])),
            get: jasmine.createSpy("armGet").and.callFake((id) => {
                if (id in armAccounts) {
                    return of(armAccounts[id]);
                } else {
                    return throwError(new ServerError({ status: 404 } as any));
                }
            }),
        };
        localAccountSpy = {
            accounts: new BehaviorSubject(List([localAccount1, localAccount2])),
            get: jasmine.createSpy("localGet").and.callFake((id) => {
                if (id in localAccounts) {
                    return of(localAccounts[id]);
                } else {
                    return throwError(new ServerError({ status: 404 } as any));
                }
            }),
        };

        subscriptionServiceSpy = {
            subscriptions: of(List([sub])),
            get: () => of(sub),
        };

        userSpecificStoreSpy = {
            watchItem: jasmine.createSpy("storage.watchItem").and.returnValue(favoritesSavedData),
            setItem: jasmine.createSpy("storage.set").and.callFake((k, v) => {
                favoritesSavedData.next(v);
                return of(null);
            }),
        };
        service = new BatchAccountService(
            armAccountSpy, localAccountSpy, userSpecificStoreSpy, null, subscriptionServiceSpy);
        subs.push(service.accounts.subscribe(x => accounts = x.toArray()));
        service.loadInitialData();
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

    describe("favorites", () => {
        let favorites;

        beforeEach(() => {
            favorites = null;
            service.accountFavorites.subscribe(x => favorites = x);
        });

        it("get the accounts from the cache", () => {
            expect(favorites).toBe(null, "should be null before data is loaded");

            favoritesSavedData.next([
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
                { id: "local/https://testaccount2.westus2.batch.azure.com" },
            ]);

            expect(favorites.toArray()).toEqual([
                armAccount1,
                localAccount2,
            ]);
        });

        it("ignores invalid ids", () => {
            expect(favorites).toBe(null, "should be null before data is loaded");

            favoritesSavedData.next([
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
                { id: "/subscriptions/invalid/resoruce/batch-accounts/invalid" },
                { id: "local/https://testaccount2.westus2.batch.azure.com" },
                { id: "local/invalid" },
            ]);
            expect(favorites.toArray()).toEqual([
                armAccount1,
                new ArmBatchAccount({
                    id: "/subscriptions/invalid/resoruce/batch-accounts/invalid",
                } as any),
                localAccount2,
                new ArmBatchAccount({
                    id: "local/invalid",
                } as any),
            ]);
        });

        it("favorite an account", async () => {
            favoritesSavedData.next([
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
                { id: "local/https://testaccount2.westus2.batch.azure.com" },
            ]);

            await service.favoriteAccount("/subscriptions/sub1/resources/batch-accounts/arm-account-2").toPromise();

            expect(userSpecificStoreSpy.setItem).toHaveBeenCalledWith("account-favorites", [
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
                { id: "local/https://testaccount2.westus2.batch.azure.com" },
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-2" },
            ]);

            expect(favorites.toArray()).toEqual([
                armAccount1,
                localAccount2,
                armAccount2,
            ]);
        });

        it("unfavorite an account", async () => {
            favoritesSavedData.next([
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
                { id: "local/https://testaccount2.westus2.batch.azure.com" },
            ]);

            await service.unFavoriteAccount("local/https://testaccount2.westus2.batch.azure.com").toPromise();

            expect(favorites.toArray()).toEqual([
                armAccount1,
            ]);

            expect(userSpecificStoreSpy.setItem).toHaveBeenCalledWith("account-favorites", [
                { id: "/subscriptions/sub1/resources/batch-accounts/arm-account-1" },
            ]);
        });
    });
});
