import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { List } from "immutable";

import { RouterTestingModule } from "@angular/router/testing";
import { ElectronModule, FormModule } from "@batch-flask/ui";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { VmSizePickerComponent } from "app/components/pool/action/add";
import { ArmBatchAccount, VmSize } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { BatchAccountService, PricingService, VmSizeService } from "app/services";
import { OSPricing } from "app/services/pricing";
import { BehaviorSubject, of } from "rxjs";
import { updateInput } from "test/utils/helpers";

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
        accountServiceSpy = {
            currentAccount: of(new ArmBatchAccount({ location: "westus" } as any)),
        };

        pricingServiceSpy = {
            getPrice: () => of(0),
            getPrices: () => of(new OSPricing("westus", "linux")),
        };

        vmSizeServiceSpy = {
            vmSizeCategories: of({
                all: [
                    ".*",
                ],
                standard: [
                    "^standard_a[0-9a-z]*$",
                ],
                compute: [
                    "^standard_c[0-9a-z]*$",
                ],
                memory: [
                    "^standard_m",
                ],
            }),
            virtualMachineSizes: new BehaviorSubject(List([
                new VmSize({ name: "Standard_A1" } as any),
                new VmSize({ name: "Standard_A2" } as any),
                new VmSize({ name: "Standard_A3" } as any),
                new VmSize({ name: "Standard_A1_v2" } as any),
                new VmSize({ name: "Standard_A2_v2" } as any),
                new VmSize({ name: "Standard_A4_v2" } as any),
                new VmSize({ name: "Standard_A8_v2" } as any),
                new VmSize({ name: "Standard_A2m_v2" } as any),
                new VmSize({ name: "Standard_A4m_v2" } as any),
                new VmSize({ name: "Standard_A8m_v2" } as any),
                new VmSize({ name: "Standard_C1" } as any),
                new VmSize({ name: "Standard_C2" } as any),
                new VmSize({ name: "Standard_O1" } as any),
            ])),
            cloudServiceSizes: new BehaviorSubject(List([
                new VmSize({ name: "Standard_A1" } as any),
                new VmSize({ name: "Standard_A2" } as any),
                new VmSize({ name: "Standard_A3" } as any),
                new VmSize({ name: "Standard_C1" } as any),
                new VmSize({ name: "Standard_C2" } as any),
                new VmSize({ name: "Standard_A8_v2" } as any),
                new VmSize({ name: "Standard_A2m_v2" } as any),
                new VmSize({ name: "Standard_A8m_v2" } as any),
            ])),
        };

        TestBed.configureTestingModule({
            imports: [
                BrowserModule, FormsModule, ReactiveFormsModule, TableTestingModule,
                NoopAnimationsModule, ElectronModule, RouterTestingModule, FormModule,
            ],
            declarations: [VmSizePickerComponent, TestComponent],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: PricingService, useValue: pricingServiceSpy },
                { provide: VmSizeService, useValue: vmSizeServiceSpy },
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

    it("should select the size if click on it", () => {
        component.pickSize("Standard_A2");
        fixture.detectChanges();
        expect(testComponent.vmSize).toEqual("Standard_A2");
    });

    it("Should show all vm with no searchName presents", () => {
        const searchResult = de.queryAll(By.css("bl-table bl-row-render"))
            .map(t => t.nativeElement.textContent.toLowerCase());
        expect(searchResult[0]).toContain("a1");
        expect(searchResult[1]).toContain("a2");
        expect(searchResult[2]).toContain("a3");
        expect(searchResult[3]).toContain("a1_v2");
        expect(searchResult[4]).toContain("a2_v2");
        expect(searchResult[5]).toContain("a4_v2");
        expect(searchResult[6]).toContain("a8_v2");
        expect(searchResult[7]).toContain("a2m_v2");
        expect(searchResult[8]).toContain("a4m_v2");
        expect(searchResult[9]).toContain("a8m_v2");
        expect(searchResult[10]).toContain("c1");
        expect(searchResult[11]).toContain("c2");
        expect(searchResult[12]).toContain("o1");
    });

    it("Should show av2 vm series by when user search in filter", () => {
        component.onFilterChange({
            category: "a",
            searchName: "_v2",
        });
        fixture.detectChanges();
        const searchResult = de.queryAll(By.css("bl-table bl-row-render"))
            .map(t => t.nativeElement.textContent.toLowerCase());
        expect(searchResult[0]).toContain("a1_v2");
        expect(searchResult[1]).toContain("a2_v2");
        expect(searchResult[2]).toContain("a4_v2");
        expect(searchResult[3]).toContain("a8_v2");
        expect(searchResult[4]).toContain("a2m_v2");
        expect(searchResult[5]).toContain("a4m_v2");
        expect(searchResult[6]).toContain("a8m_v2");
    });

    it("Should show all vm with no searchName presents", () => {
        component.onFilterChange({
            category: "all",
            searchName: "",
        });
        fixture.detectChanges();
        const searchResult = de.queryAll(By.css("bl-table bl-row-render")).map(t => t.nativeElement.textContent);
        expect(searchResult.length).toEqual(13);
    });

    describe("when it fails to load the vm sizes", () => {
        let plainInputEl: DebugElement;

        beforeEach(() => {
            vmSizeServiceSpy.virtualMachineSizes.next(null);
            fixture.detectChanges();
            plainInputEl = de.query(By.css(".no-vm-sizes-basic-input input"));
        });

        it("shows a plain input when its unable to load the vm sizes", () => {
            expect(plainInputEl).not.toBeFalsy();
        });

        it("propagate the changes when updating the input", () => {
            updateInput(plainInputEl, "Standard_D4_V2");
            expect(testComponent.vmSize).toEqual("Standard_D4_V2");
        });
    });
});
