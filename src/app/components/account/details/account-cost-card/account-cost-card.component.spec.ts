import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ChartsModule } from "@batch-flask/ui";
import { ArmBatchAccount, ArmSubscription, LocalBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import { UsageDetail, UsageDetailsService, UsageDetailsUnsupportedSubscription } from "app/services/azure-consumption";
import { BehaviorSubject, of, throwError } from "rxjs";
import { AccountCostCardComponent } from "./account-cost-card.component";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const internalSub = new ArmSubscription({
    id: "/subscriptions/internal-1",
    subscriptionId: "internal-1",
});

const day1 = new Date(2018, 11, 5);
const day2 = new Date(2018, 11, 6);
const day3 = new Date(2018, 11, 7);

const usage1: UsageDetail = {
    id: "usages/use-1",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 0.5,
        usageStart: day1,
        meterId: "meter-1",
        meterDetails: {
            meterName: "VM",
        },
    } as any,
};

const usage2: UsageDetail = {
    id: "usages/use-2",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 3.8,
        usageStart: new Date(2018, 11, 6),
        meterId: "meter-1",
        meterDetails: {
            meterName: "VM",
        },
    } as any,
};

const usage3: UsageDetail = {
    id: "usages/use-3",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 9.1,
        usageStart: new Date(2018, 11, 7),
        meterId: "meter-1",
        meterDetails: {
            meterName: "VM",
        },
    } as any,
};

const usage4: UsageDetail = {
    id: "usages/use-1",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 1.5,
        usageStart: day1,
        meterId: "meter-2",
        meterDetails: {
            meterName: "Data",
        },
    } as any,
};

const usage5: UsageDetail = {
    id: "usages/use-2",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 5.8,
        usageStart: new Date(2018, 11, 6),
        meterId: "meter-2",
        meterDetails: {
            meterName: "Data",
        },
    } as any,
};

const usage6: UsageDetail = {
    id: "usages/use-3",
    name: "use-1",
    properties: {
        instanceId: "/subs/sub-1/batchaccounts/acc-1",
        pretaxCost: 11.3,
        usageStart: new Date(2018, 11, 7),
        meterId: "meter-2",
        meterDetails: {
            meterName: "Data",
        },
    } as any,
};

@Component({
    template: `<bl-account-cost-card></bl-account-cost-card>`,
})
class TestComponent {
}

describe("AccountCostCardComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: AccountCostCardComponent;
    let de: DebugElement;

    let usageServiceSpy;
    let accountServiceSpy;
    let themeServiceSpy;

    beforeEach(() => {
        usageServiceSpy = {
            getUsage: jasmine.createSpy("getUsage").and.callFake(() => {
                const sub = accountServiceSpy.currentAccount.value.subscription;
                if (sub === internalSub) {
                    return throwError(new UsageDetailsUnsupportedSubscription(sub.subscriptionId));
                } else {
                    return of([usage1, usage2, usage3, usage4, usage5, usage6]);
                }
            }),
        };

        accountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: "/subs/sub-1/batchaccounts/acc-1",
                name: "acc-1",
                location: "westus",
                properties: {} as any,
                subscription: sub1,
            })),
        };

        themeServiceSpy = {
            currentTheme: of(new Theme({
                "chart-colors": [
                    "#003f5c",
                    "#aa3939",
                    "#4caf50",
                    "#ffa600",
                ],
            } as any)),
        };

        TestBed.configureTestingModule({
            imports: [I18nTestingModule, ChartsModule],
            declarations: [AccountCostCardComponent, TestComponent],
            providers: [
                { provide: UsageDetailsService, useValue: usageServiceSpy },
                { provide: ThemeService, useValue: themeServiceSpy },
                { provide: BatchAccountService, useValue: accountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-account-cost-card"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("shows unsupported message when using local batch account", () => {
        accountServiceSpy.currentAccount.next(new LocalBatchAccount({ name: "foo" }));
        fixture.detectChanges();
        const info = de.query(By.css(".unavailable-info"));
        expect(info).not.toBeFalsy();
        expect(info.nativeElement.textContent).toContain("account-cost-card.usingLocalAccount");
        expect(info.nativeElement.textContent).not.toContain("account-cost-card.unsupportedSubscription");
    });

    it("shows unsupported message when subscription is internal", () => {
        accountServiceSpy.currentAccount.next(new ArmBatchAccount({
            id: "/subs/sub-1/batchaccounts/acc-2",
            name: "acc-2",
            location: "westus",
            properties: {} as any,
            subscription: internalSub,
        }));
        fixture.detectChanges();
        const info = de.query(By.css(".unavailable-info"));
        expect(info).not.toBeFalsy();
        expect(info.nativeElement.textContent).toContain("account-cost-card.unsupportedSubscription");
        expect(info.nativeElement.textContent).not.toContain("account-cost-card.usingLocalAccount");
    });

    it("builds the datasets", () => {
        const dataset1 = {
            label: "VM",
            backgroundColor: "#003f5c",
            borderColor: "#003f5c",
            data: [
                { x: day1, y: 0.5 },
                { x: day2, y: 3.8 },
                { x: day3, y: 9.1 },
            ],
        };
        const dataset2 = {
            label: "Data",
            backgroundColor: "#aa3939",
            borderColor: "#aa3939",
            data: [
                { x: day1, y: 1.5 },
                { x: day2, y: 5.8 },
                { x: day3, y: 11.3 },
            ],
        };
        expect(component.datasets).toEqual([
            dataset1,
            dataset2,
        ]);
    });
});
