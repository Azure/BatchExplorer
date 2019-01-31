import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule, SidebarManager } from "@batch-flask/ui";
import { BannerComponent } from "@batch-flask/ui/banner";
import { CardComponent } from "@batch-flask/ui/card";
import { ArmBatchAccount, Subscription } from "app/models";
import { BatchAccountService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { StorageErrorDisplayComponent } from "./storage-error-display.component";

@Component({
    template: `<bl-storage-error-display [noClassic]="noClassic"></bl-storage-error-display>`,
})
class TestComponent {
    public noClassic = false;
}

const sub1 = new Subscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const accountArmStorage = new ArmBatchAccount({
    id: "/subs/sub-1/acc-arm-storage",
    name: "acc-arm-storage",
    subscription: sub1,
    location: "westus",
    properties: {
        autoStorage: {
            lastKeySync: new Date(),
            storageAccountId: "/subs/sub-1/Microsoft.Storage/storageAccounts/arm-storage-1",
        },
    } as any,
});
const accountClassicStorage = new ArmBatchAccount({
    id: "/subs/sub-1/acc-classic-storage",
    name: "acc-classic-storage",
    subscription: sub1,
    location: "westus",
    properties: {
        autoStorage: {
            lastKeySync: new Date(),
            storageAccountId: "/subs/sub-1/Microsoft.ClassicStorage/storageAccounts/classic-storage-1",
        },
    } as any,
});
const accountNOStorage = new ArmBatchAccount({
    id: "/subs/sub-1/acc-no-storage",
    name: "acc-no-storage",
    subscription: sub1,
    location: "westus",
    properties: {
    } as any,
});

describe("StorageErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let accountServiceSpy;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: new BehaviorSubject(accountArmStorage),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule, ButtonsModule],
            declarations: [StorageErrorDisplayComponent, TestComponent, BannerComponent, CardComponent],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: SidebarManager, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-storage-error-display"));
        fixture.detectChanges();
    });

    function getBanner() {
        return de.query(By.css("bl-banner"));
    }

    describe("when accepting classic storage accounts", () => {

        it("shows nothing when autostorage is ARM", () => {
            accountServiceSpy.currentAccount.next(accountArmStorage);
            fixture.detectChanges();
            expect(getBanner()).toBeFalsy();
        });
        it("shows nothing when autostorage is Classic", () => {
            accountServiceSpy.currentAccount.next(accountClassicStorage);
            fixture.detectChanges();
            expect(getBanner()).toBeFalsy();
        });
        it("shows error when using account with no autostorage ", () => {
            accountServiceSpy.currentAccount.next(accountNOStorage);
            fixture.detectChanges();
            const banner = getBanner();
            expect(banner).not.toBeFalsy();
            expect(banner.nativeElement.textContent).toContain("storage-error-display.noAutoStorage");
        });
    });

    describe("when NOT accepting classic storage accounts", () => {
        beforeEach(() => {
            testComponent.noClassic = true;
            fixture.detectChanges();
        });

        it("shows nothing when autostorage is ARM", () => {
            accountServiceSpy.currentAccount.next(accountArmStorage);
            fixture.detectChanges();
            expect(getBanner()).toBeFalsy();
        });

        it("shows Classic error when autostorage is Classic", () => {
            accountServiceSpy.currentAccount.next(accountClassicStorage);
            fixture.detectChanges();

            const banner = getBanner();
            expect(banner).not.toBeFalsy();
            expect(banner.nativeElement.textContent).toContain("storage-error-display.isClassic");
        });

        it("shows error when using account with no autostorage ", () => {
            accountServiceSpy.currentAccount.next(accountNOStorage);
            fixture.detectChanges();
            const banner = getBanner();
            expect(banner).not.toBeFalsy();
            expect(banner.nativeElement.textContent).toContain("storage-error-display.noAutoStorage");
        });
    });
});
