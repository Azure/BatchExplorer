import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { StorageAccountCardComponent } from "app/components/account/details";
import { ButtonComponent } from "app/components/base/buttons";
import * as buttons from "app/components/base/buttons";
import { SidebarManager } from "app/components/base/sidebar";
import { AccountResource, ServerError, StorageAccount } from "app/models";
import { AuthorizationHttpService , StorageAccountService } from "app/services";

const accountNoStorage = new AccountResource({ id: "acc-1", location: "westus", properties: {} } as any);
const accountWithStorage = new AccountResource({
    id: "acc-1",
    location: "westus",
    properties: {
        autoStorage: { storageAccountId: "sub-1/storage-1" },
    },
} as any);
const accountWithInvalidStorage = new AccountResource({
    id: "acc-1",
    location: "westus",
    properties: {
        autoStorage: { storageAccountId: "sub-1/storage-wrong" },
    },
} as any);
const storage1 = new StorageAccount({ id: "sub-1/storage-1", name: "storage-1", location: "westus" } as any);

@Component({
    template: `<bl-storage-account-card [account]="account"></bl-storage-account-card>`,
})
class TestComponent {
    public account = accountWithStorage;
}
console.log("Storage card?", StorageAccountCardComponent, TestComponent, ButtonComponent);
console.log("Other buttons", buttons.ButtonComponent);
fdescribe("StorageAccountCardComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let storageAccountServiceSpy;

    beforeEach(() => {
        storageAccountServiceSpy = {
            get: (storageAccountId: string) => {
                if (storageAccountId === "sub-1/storage-1") {
                    return Observable.of(storage1);
                } else {
                    return Observable.throw(new ServerError({
                        status: 404,
                        statusText: "Not found",
                        code: "StorageAccountNotFound",
                        message: "Storage doesn't exists",
                        original: null,
                    }));
                }
            },
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [StorageAccountCardComponent, TestComponent, ButtonComponent],
            providers: [
                { provide: AuthorizationHttpService, useValue: null },
                { provide: SidebarManager, useValue: null },
                { provide: StorageAccountService, useValue: storageAccountServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-storage-account-card"));
        fixture.detectChanges();
    });

    describe("when account has no storage account", () => {
        beforeEach(() => {
            testComponent.account = accountNoStorage;
            fixture.detectChanges();
        });

        fit("should show the button with setup text", () => {
            const btn = de.query(By.css("bl-button.edit"));
            expect(btn).not.toBeFalsy();
            expect(btn.nativeElement.textContent).toContain("Setup");
            expect(btn.nativeElement.textContent).not.toContain("Edit");
        });
    });

    describe("when account has A storage account", () => {
        beforeEach(() => {
            testComponent.account = accountWithStorage;
            fixture.detectChanges();
        });

        it("should show the button with edit text", () => {
            const btn = de.query(By.css("bl-button.edit"));
            expect(btn).not.toBeFalsy();
            expect(btn.nativeElement.textContent).toContain("Edit");
            expect(btn.nativeElement.textContent).not.toContain("Setup");
        });

        it("should show the account name", () => {
            expect(de.query(By.css(".details")).nativeElement.textContent).toContain("storage-1");
        });
    });

    describe("when account has A Invalid storage account", () => {
        beforeEach(() => {
            testComponent.account = accountWithInvalidStorage;
            fixture.detectChanges();
        });

        it("should show the button with edit text", () => {
            const btn = de.query(By.css("bl-button.edit"));
            expect(btn).not.toBeFalsy();
            expect(btn.nativeElement.textContent).toContain("Edit");
            expect(btn.nativeElement.textContent).not.toContain("Setup");
        });

        it("should show the error", () => {
            expect(de.query(By.css(".details")).nativeElement.textContent).toContain("Not found");
        });
    });
});
