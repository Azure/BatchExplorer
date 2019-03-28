import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { ChartsModule, QuickRange, TimeRange } from "@batch-flask/ui";
import { ArmBatchAccount, ArmSubscription, LocalBatchAccount } from "app/models";
import { BatchAccountService, Theme, ThemeService } from "app/services";
import { AzureCostManagementService, BatchAccountCost } from "app/services/azure-cost-management";
import { BehaviorSubject, of } from "rxjs";
import { AccountCostCardComponent } from "./account-cost-card.component";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const day1 = new Date(2019, 1, 1);
const day2 = new Date(2019, 1, 2);
const day3 = new Date(2019, 1, 3);
const day4 = new Date(2019, 1, 4);

const costs: BatchAccountCost = {
    currency: "USD",
    totalForPeriod: 54.3,
    pools: {
        pool1: {
            totalForPeriod: 34,
            costs: [
                { preTaxCost: 1, date: day1 },
                { preTaxCost: 1.5, date: day2 },
                { preTaxCost: 8, date: day3 },
                { preTaxCost: 3.8, date: day4 },
            ],
        },
        pool2: {
            totalForPeriod: 66,
            costs: [
                { preTaxCost: 0, date: day1 },
                { preTaxCost: 0, date: day2 },
                { preTaxCost: 39, date: day3 },
                { preTaxCost: 27, date: day4 },
            ],
        },
    },

};

@Component({
    selector: "bl-time-range-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeTimeRangePickerComponent)],
})
class FakeTimeRangePickerComponent extends MockControlValueAccessorComponent<TimeRange | null> {
    @Input() public quickRanges: QuickRange[];
}

@Component({
    template: `<bl-account-cost-card></bl-account-cost-card>`,
})
class TestComponent {
}

describe("AccountCostCardComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: AccountCostCardComponent;
    let de: DebugElement;

    let costServiceSpy;
    let accountServiceSpy;
    let themeServiceSpy;

    beforeEach(() => {
        costServiceSpy = {
            getCost: jasmine.createSpy("getCost").and.callFake(() => {
                return of(costs);
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
            imports: [I18nTestingModule, ChartsModule, FormsModule, ReactiveFormsModule],
            declarations: [AccountCostCardComponent, FakeTimeRangePickerComponent, TestComponent],
            providers: [
                { provide: AzureCostManagementService, useValue: costServiceSpy },
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

    it("builds the datasets", () => {
        const dataset1 = {
            label: "pool1",
            backgroundColor: "#003f5c",
            borderColor: "#003f5c",
            data: [
                { x: day1, y: 1 },
                { x: day2, y: 1.5 },
                { x: day3, y: 8 },
                { x: day4, y: 3.8 },
            ],
        };
        const dataset2 = {
            label: "pool2",
            backgroundColor: "#aa3939",
            borderColor: "#aa3939",
            data: [
                { x: day1, y: 0 },
                { x: day2, y: 0 },
                { x: day3, y: 39 },
                { x: day4, y: 27 },
            ],
        };
        expect(component.datasets).toEqual([
            dataset1,
            dataset2,
        ]);
    });
});
