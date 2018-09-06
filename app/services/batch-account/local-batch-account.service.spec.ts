import { LocalBatchAccount } from "app/models";
import { of } from "rxjs";
import { LOCAL_BATCH_ACCOUNT_KEY, LocalBatchAccountService } from "./local-batch-account.service";

const account1 = {
    displayName: "Foo",
    name: "testaccount1",
    key: "somekey==",
    url: "https://testaccount1.westus2.batch.azure.com",
};

const account2 = {
    displayName: "Bar",
    name: "testaccount2",
    key: "somekey==",
    url: "https://testaccount2.westus2.batch.azure.com",
};

class MockLocalFileStorage {
    private _map = new Map();

    public set(key, value) {
        this._map.set(key, value);
        return of();
    }

    public get(key) {
        return of(this._map.get(key));
    }
}

describe("LocalBatchAccountService", () => {
    let service: LocalBatchAccountService;
    let storageSpy: MockLocalFileStorage;
    let accounts: LocalBatchAccount[];

    beforeEach(async () => {
        storageSpy = new MockLocalFileStorage();
        storageSpy.set(LOCAL_BATCH_ACCOUNT_KEY, [
            account1,
            account2,
        ]);
        service = new LocalBatchAccountService(storageSpy as any);
        service.accounts.subscribe(x => accounts = x.toArray());
        await service.load().toPromise();
    });

    it("Loads accounts from the local data store", () => {
        expect(accounts.length).toBe(2);
        expect(accounts[0].toJS()).toEqual(account1);
        expect(accounts[1].toJS()).toEqual(account2);
    });

    it("gets accounts by id", async () => {
        let account = await service.get("local/https://testaccount1.westus2.batch.azure.com").toPromise();
        expect(account.toJS()).toEqual(account1);
        account = await service.get("local/https://testaccount2.westus2.batch.azure.com").toPromise();
        expect(account.toJS()).toEqual(account2);
    });

    it("delete accounts update the account list and the data store", async () => {
        await service.delete("local/https://testaccount1.westus2.batch.azure.com").toPromise();
        expect(accounts.length).toBe(1);
        expect(accounts[0].toJS()).toEqual(account2);
        const data = await storageSpy.get(LOCAL_BATCH_ACCOUNT_KEY).toPromise();
        expect(data).toEqual([account2]);
    });

    it("create a new account update the account list and the data store", async () => {
        const account3 = {
            displayName: "Something",
            name: "testaccount3",
            key: "somekey==",
            url: "https://testaccount3.westus2.batch.azure.com",
        };
        await service.create(new LocalBatchAccount(account3)).toPromise();
        expect(accounts.length).toBe(3);
        expect(accounts[0].toJS()).toEqual(account1);
        expect(accounts[1].toJS()).toEqual(account2);
        expect(accounts[2].toJS()).toEqual(account3);
        const data = await storageSpy.get(LOCAL_BATCH_ACCOUNT_KEY).toPromise();
        expect(data).toEqual([account1, account2, account3]);
    });

    it("Get accoutn name from id", () => {
        let name = service.getNameFromId("local/https://testaccount2.westus2.batch.azure.com");
        expect(name).toEqual("testaccount2");
        name = service.getNameFromId("local/https://other.format");
        expect(name).toEqual("https://other.format");
    });
});
