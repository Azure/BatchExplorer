import { fakeAsync, tick } from "@angular/core/testing";
import { AsyncSubject, Subscription, of } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService } from "app/services";
import { DataCache } from "app/services/core";
import { first } from "rxjs/operators";

describe("AccountService", () => {
    let accountService: AccountService;
    let currentAccount: AccountResource;
    let currentAccountId: string;
    const account1 = new AccountResource({ id: "account-1" } as any);
    let subscriptionServiceSpy;
    const subs: Subscription[] = [];
    let storageSpy;

    beforeEach(() => {
        currentAccount = undefined;
        subscriptionServiceSpy = {
            cache: new DataCache<any>(),
        };

        storageSpy = {};

        accountService = new AccountService(storageSpy, {} as any, subscriptionServiceSpy);
        accountService.get = jasmine.createSpy("get").and.returnValue(of(account1));
        accountService.getAccountKeys = jasmine.createSpy("getAccountKeys").and.returnValue(of({}));
        subs.push(accountService.currentAccountId.subscribe(x => currentAccountId = x));
        subs.push(accountService.currentAccount.subscribe(x => currentAccount = x));
    });

    afterEach(() => {
        accountService = null;
        subs.forEach(x => x.unsubscribe());
    });

    /**
     * Note: If there is an error here that shown is in a completely different component(e.g. AccountListComponent)
     * It means that component has a subscription not being cleanup. Check ngOnDestroy cleanup all subscription started.
     */
    it("currentAccount should not return anything until a value has been loaded", () => {
        const accountSubscriptionSpy = jasmine.createSpy("currentAccount");
        accountService.currentAccount.pipe(first()).subscribe(accountSubscriptionSpy);
        expect(accountSubscriptionSpy).not.toHaveBeenCalled();
        expect(currentAccount).toBeUndefined();

        accountService.selectAccount("account-1");
        expect(currentAccountId).toEqual("account-1", "Account id should have been updated immediately");
        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-1");
    });

    it("currentAccount should not return anything after selectAccount is called until done loading", fakeAsync(() => {
        accountService.selectAccount("account-1");
        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-1");

        const accountSubject = new AsyncSubject();
        accountService.get = jasmine.createSpy("get").and.returnValue(accountSubject);

        accountService.selectAccount("account-2");
        currentAccount = undefined;
        subs.push(accountService.currentAccount.subscribe((x) => currentAccount = x));
        expect(currentAccountId).toEqual("account-2", "Account id should have been updated immediately");
        expect(currentAccount).toBeUndefined();

        accountSubject.next(new AccountResource({ id: "account-2" } as any));
        accountSubject.complete();
        tick();

        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-2");
    }));

    it("select account should be case insensitive", () => {
        accountService.selectAccount("ACCOUNT-1");
        expect(currentAccount).not.toBeUndefined();
        expect(currentAccount.id).toBe("account-1");
    });
});
