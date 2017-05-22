import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs";

import { AccountListComponent } from "app/components/account/browse";
import { SidebarManager } from "app/components/base/sidebar";
import { AccountService, SubscriptionService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import * as Fixtures from "test/fixture";
import { NoItemMockComponent } from "test/utils/mocks/components";

const sub1 = Fixtures.subscription.create({
    id: "/subsccriptions/sub-1",
    subscriptionId: "sub-1",
    displayName: "My test subscription",
});

const sub2 = Fixtures.subscription.create({
    id: "/subsccriptions/sub-2",
    subscriptionId: "sub-2",
    displayName: "Someone test subscription",
});

const sub3 = Fixtures.subscription.create({
    id: "/subsccriptions/sub-3",
    subscriptionId: "sub-3",
    displayName: "His test subscription",
});

describe("AccountListComponent", () => {
    let fixture: ComponentFixture<AccountListComponent>;
    let component: AccountListComponent;
    let de: DebugElement;
    let accountService: any;
    let subscriptionService: any;
    let accountsElList: DebugElement[];

    beforeEach(() => {
        accountService = {
            accountsLoaded: Observable.of(true),
            accounts: Observable.of([
                Fixtures.account.create({ id: "acc-1", name: "Batch 1", location: "westus", subscription: sub1 }),
                Fixtures.account.create({ id: "acc-2", name: "Account 2", location: "eastus", subscription: sub1 }),
                Fixtures.account.create({ id: "acc-3", name: "Account 3", location: "canada", subscription: sub2 }),
                Fixtures.account.create({ id: "acc-4", name: "Zoo Account 4", location: "eastus", subscription: sub2 }),
            ]),
            isAccountFavorite: (accountId) => false,
        };

        subscriptionService = {
            subscriptions: Observable.of([sub1, sub2, sub3]),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AccountListComponent, NoItemMockComponent],
            providers: [
                { provide: AccountService, useValue: accountService },
                { provide: SidebarManager, useValue: null },
                { provide: SubscriptionService, useValue: subscriptionService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(AccountListComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();

        accountsElList = de.queryAll(By.css("bl-quick-list-item"));
    });

    it("Should list all accounts sorted alphabetically", () => {
        expect(accountsElList.length).toBe(4);
        expect(accountsElList[0].nativeElement.textContent).toContain("Account 2");
        expect(accountsElList[0].nativeElement.textContent).toContain("eastus");

        expect(accountsElList[1].nativeElement.textContent).toContain("Account 3");
        expect(accountsElList[1].nativeElement.textContent).toContain("canada");

        expect(accountsElList[2].nativeElement.textContent).toContain("Batch 1");
        expect(accountsElList[2].nativeElement.textContent).toContain("westus");

        expect(accountsElList[3].nativeElement.textContent).toContain("Zoo Account 4");
        expect(accountsElList[3].nativeElement.textContent).toContain("eastus");
    });

    it("should filter by name", () => {
        component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("zoO"));
        fixture.detectChanges();
        accountsElList = de.queryAll(By.css("bl-quick-list-item"));

        expect(accountsElList.length).toBe(1);

        expect(accountsElList[0].nativeElement.textContent).toContain("Zoo Account 4");
    });

    it("should filter by subscription", () => {
        component.filter = FilterBuilder.and(FilterBuilder.prop("subscriptionId").eq("sub-1"));
        fixture.detectChanges();
        accountsElList = de.queryAll(By.css("bl-quick-list-item"));

        expect(accountsElList.length).toBe(2);

        expect(accountsElList[0].nativeElement.textContent).toContain("Account 2");
        expect(accountsElList[1].nativeElement.textContent).toContain("Batch 1");
    });

    it("should filter by subscription and by name", () => {
        component.filter = FilterBuilder.and(
            FilterBuilder.prop("id").startswith("Acc"),
            FilterBuilder.prop("subscriptionId").eq("sub-1"),
        );
        fixture.detectChanges();
        accountsElList = de.queryAll(By.css("bl-quick-list-item"));

        expect(accountsElList.length).toBe(1);

        expect(accountsElList[0].nativeElement.textContent).toContain("Account 2");
    });
});
