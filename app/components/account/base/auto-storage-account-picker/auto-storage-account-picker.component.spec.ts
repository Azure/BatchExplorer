import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { List } from "immutable";

import { TableTestingModule } from "@batch-flask/ui/testing";
import { ArmBatchAccount, StorageAccount } from "app/models";
import { StorageAccountService } from "app/services";
import { of } from "rxjs";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { LoadingMockComponent } from "test/utils/mocks/components";
import { AutoStorageAccountPickerComponent } from "./auto-storage-account-picker.component";

const account = new ArmBatchAccount({
    id: "acc-1", location: "westus",
    subscription: { subscriptionId: "sub-1" },
} as any);

@Component({
    template: `
        <bl-auto-storage-account-picker [account]="account" [(ngModel)]="storageAccountId">
        </bl-auto-storage-account-picker>
    `,
})
class TestComponent {
    public storageAccountId: string;
    public account = account;
}

describe("AutoStorageAccountPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AutoStorageAccountPickerComponent;
    let de: DebugElement;
    let storageServiceSpy;
    let preferedTable: DebugElement;
    let otherTable: DebugElement;

    beforeEach(() => {
        storageServiceSpy = {
            list: () => of(List([
                new StorageAccount({ id: "sub-1/storage-1", name: "storage-1", location: "westus" } as any),
                new StorageAccount({ id: "sub-1/storage-2", name: "storage-2", location: "brazilsouth" } as any),
                new StorageAccount({ id: "sub-1/storage-3", name: "storage-3", location: "westus" } as any),
                new StorageAccount({ id: "sub-1/storage-4", name: "storage-4", location: "easteurope" } as any),
                new StorageAccount({ id: "sub-1/storage-5", name: "storage-5", location: "eastus" } as any),
            ])),
        };
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, FormsModule, TableTestingModule, ElectronTestingModule],
            declarations: [
                AutoStorageAccountPickerComponent,
                LoadingMockComponent, TestComponent,
            ],
            providers: [
                { provide: StorageAccountService, useValue: storageServiceSpy },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-auto-storage-account-picker"));
        component = de.componentInstance;
        fixture.detectChanges();

        preferedTable = de.query(By.css(".prefered bl-table"));
        otherTable = de.query(By.css(".others bl-table"));
    });

    it("should split accounts in best region and other regions", () => {
        const preferedRows = preferedTable.queryAll(By.css("bl-row-render"));
        expect(preferedRows.length).toBe(2);
        expect(preferedRows[0].nativeElement.textContent).toContain("storage-1");
        expect(preferedRows[0].nativeElement.textContent).toContain("westus");
        expect(preferedRows[1].nativeElement.textContent).toContain("storage-3");
        expect(preferedRows[1].nativeElement.textContent).toContain("westus");

        const otherRows = otherTable.queryAll(By.css("bl-row-render"));
        expect(otherRows.length).toBe(3);
        expect(otherRows[0].nativeElement.textContent).toContain("storage-2");
        expect(otherRows[1].nativeElement.textContent).toContain("storage-4");
        expect(otherRows[2].nativeElement.textContent).toContain("storage-5");
    });

    it("should propagate changes", () => {
        component.pickStorageAccount("sub-1/storage-3");
        fixture.detectChanges();

        expect(testComponent.storageAccountId).toBe("sub-1/storage-3", "Change should propagate");
        expect(preferedTable.componentInstance.activeItem).toBe("sub-1/storage-3", "Prefered Table updated activeItem");
        expect(otherTable.componentInstance.activeItem).toBe("sub-1/storage-3", "Others Table updated activeItem");
    });

    it("should unselect account when clicking on the no storage account row", () => {
        component.pickStorageAccount("sub-1/storage-3");
        fixture.detectChanges();

        component.pickStorageAccount(component.noSelectionKey);
        fixture.detectChanges();

        expect(testComponent.storageAccountId).toBe(null, "Change should propagate");
        expect(preferedTable.componentInstance.activeItem).toBe(component.noSelectionKey,
            "Prefered Table updated activeItem");
        expect(otherTable.componentInstance.activeItem).toBe(component.noSelectionKey,
            "Others Table updated activeItem");
    });
});
