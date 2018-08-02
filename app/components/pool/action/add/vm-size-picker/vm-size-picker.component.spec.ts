import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { List } from "immutable";

import { RouterTestingModule } from "@angular/router/testing";
import { ElectronModule } from "@batch-flask/ui";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { VmSizePickerComponent } from "app/components/pool/action/add";
import { AccountResource, VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { AccountService, PricingService, VmSizeService } from "app/services";
import { OSPricing } from "app/services/pricing";
import { of } from "rxjs";
import { TableTestingModule } from "test/utils/mocks/components";

@Component({
    template: `<bl-vm-size-picker [(ngModel)]="vmSize" [osSource]="osSource"></bl-vm-size-picker>`,
})
class TestComponent {
    public vmSize: string = null;
    public osSource = PoolOsSources.IaaS;
}

describe("VmSizePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: VmSizePickerComponent;
    let de: DebugElement;
    let vmSizeServiceSpy;
    let accountServiceSpy;
    let pricingServiceSpy;

    beforeEach(() => {
        vmSizeServiceSpy = {
            vmSizeCategories: of({
                standard: ["Standard_A*"],
                compute: ["Standard_C*"],
                memory: ["Standard_M*"],
            }),
            virtualMachineSizes: of(List([
                new VmSize({ name: "Standard_A1" } as any),
                new VmSize({ name: "Standard_A2" } as any),
                new VmSize({ name: "Standard_A3" } as any),
                new VmSize({ name: "Standard_C1" } as any),
                new VmSize({ name: "Standard_C2" } as any),
                new VmSize({ name: "Standard_O1" } as any),
            ])),
            cloudServiceSizes: of(List([
                new VmSize({ name: "Standard_A1" } as any),
                new VmSize({ name: "Standard_A2" } as any),
                new VmSize({ name: "Standard_A3" } as any),
                new VmSize({ name: "Standard_C1" } as any),
                new VmSize({ name: "Standard_C2" } as any),
            ])),
        };

        accountServiceSpy = {
            currentAccount: of(new AccountResource({ location: "westus" } as any)),
        };

        pricingServiceSpy = {
            getPrice: () => of(0),
            getPrices: () => of(new OSPricing("westus", "linux")),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, TableTestingModule, NoopAnimationsModule, ElectronModule, RouterTestingModule],
            declarations: [VmSizePickerComponent, TestComponent],
            providers: [
                { provide: VmSizeService, useValue: vmSizeServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: PricingService, useValue: pricingServiceSpy },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-vm-size-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("Should show 3 categories(Including other)", () => {
        const tabLabels = de.queryAll(By.css("mat-tab"));
        expect(tabLabels.length).toBe(3);
        expect(tabLabels[0].properties.label).toContain("General purpose (3)");
        expect(tabLabels[1].properties.label).toContain("Compute optimized (2)");
        expect(tabLabels[2].properties.label).toContain("Other (1)");
    });

    it("Should show vm sizes by category", () => {
        const tabs = de.queryAll(By.css("mat-tab"));
        expect(tabs.length).toBe(3);

        const tab1Sizes = tabs[0].queryAll(By.css("bl-table bl-row-render"));
        expect(tab1Sizes.length).toBe(3, "First tab should have 3 rows");
        expect(tab1Sizes[0].nativeElement.textContent).toContain("Standard A1");
        expect(tab1Sizes[1].nativeElement.textContent).toContain("Standard A2");
        expect(tab1Sizes[2].nativeElement.textContent).toContain("Standard A3");

        const tab2Sizes = tabs[1].queryAll(By.css("bl-table bl-row-render"));
        expect(tab2Sizes.length).toBe(2, "Second tab should have 2 rows");
        expect(tab2Sizes[0].nativeElement.textContent).toContain("Standard C1");
        expect(tab2Sizes[1].nativeElement.textContent).toContain("Standard C2");

        const tab3Sizes = tabs[2].queryAll(By.css("bl-table bl-row-render"));
        expect(tab3Sizes.length).toBe(1, "Third tab should have 1 rows");
        expect(tab3Sizes[0].nativeElement.textContent).toContain("Standard O1");
    });

    it("should select the size if click on it", () => {
        component.pickSize("Standard_A2");
        fixture.detectChanges();
        expect(testComponent.vmSize).toEqual("Standard_A2");
    });
});
