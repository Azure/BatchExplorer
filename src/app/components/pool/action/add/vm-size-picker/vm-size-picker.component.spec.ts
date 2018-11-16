import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { List } from "immutable";

import { RouterTestingModule } from "@angular/router/testing";
import { ElectronModule } from "@batch-flask/ui";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { VmSizePickerComponent } from "app/components/pool/action/add";
import { ArmBatchAccount, VmSize, batchExplorerDataVms } from "app/models";
import { PoolOsSources } from "app/models/forms";
import { BatchAccountService, PricingService, VmSizeService } from "app/services";
import { OSPricing } from "app/services/pricing";
import { of } from "rxjs";
import { allVmSizes, supportedVms } from "./mock-vm-size";

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
    let passVms;
    let iaasVms;
    beforeEach(() => {
        passVms = [];
        iaasVms = [];
        const vmSizeStrings = supportedVms.split("\n").filter(value => !!value.trim());
        for (const vmSize of vmSizeStrings) {
            const starter = "TVMSize.";
            const terminator = ",";
            const vm = vmSize.substring(
                vmSize.indexOf(starter) + starter.length,
                vmSize.indexOf(terminator)).toLowerCase();
            if (vmSize.includes("IAASOnly")) {
                iaasVms.push(vm);
            } else if (vmSize.includes("PAASOnly")) {
                passVms.push(vm);
            } else if (vmSize.includes("PAASAndIAAS")) {
                passVms.push(vm);
                iaasVms.push(vm);
            }
        }

        accountServiceSpy = {
            currentAccount: of(new ArmBatchAccount({ location: "westus" } as any)),
        };

        pricingServiceSpy = {
            getPrice: () => of(0),
            getPrices: () => of(new OSPricing("westus", "linux")),
        };

        vmSizeServiceSpy = new VmSizeService(null, null, accountServiceSpy);
        vmSizeServiceSpy.vmSizeCategories = of(batchExplorerDataVms.category);
        const paasRegex = batchExplorerDataVms.all.concat(batchExplorerDataVms.paas);
        const iaasRegex = batchExplorerDataVms.all.concat(batchExplorerDataVms.iaas);
        const vmSizes = List(allVmSizes.map(vmSize => {
            return {
                name: vmSize.toLowerCase(),
                numberOfCores: 1,
                memoryInMB: 1,
                osDiskSizeInMB: 1,
                resourceDiskSizeInMB: 1,
            } as VmSize;
        }));
        vmSizeServiceSpy.virtualMachineSizes = of(vmSizeServiceSpy.filterSizes(vmSizes, iaasRegex));
        vmSizeServiceSpy.cloudServiceSizes = of(vmSizeServiceSpy.filterSizes(vmSizes, paasRegex));

        TestBed.configureTestingModule({
            imports: [FormsModule, TableTestingModule, NoopAnimationsModule, ElectronModule, RouterTestingModule],
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

    it("should compare paas vms in current batch service whitelisted paas vms", () => {
        const paasRegex = batchExplorerDataVms.all.concat(batchExplorerDataVms.paas);
        const vmSizes = List(allVmSizes.map(vmSize => {
            return { name: vmSize.toLowerCase() } as VmSize;
        }));
        const result = component.vmSizeService.filterSizes(vmSizes, paasRegex).map(n => n.name).toArray();
        result.forEach(vm => expect(passVms).toContain(vm));
    });

    it("should compare iaas vms in current batch service whitelisted iaas vms", () => {
        const iaasRegex = batchExplorerDataVms.all.concat(batchExplorerDataVms.iaas);
        const vmSizes = List(allVmSizes.map(vmSize => {
            return { name: vmSize.toLowerCase() } as VmSize;
        }));
        const result = component.vmSizeService.filterSizes(vmSizes, iaasRegex).map(n => n.name).toArray();
        result.forEach(vm => expect(iaasVms).toContain(vm));
    });

    it("Should show av2 vm series by when user search in filter", () => {
        component.onFilterChange({
            category: "a",
            searchName: "_v2",
        });
        fixture.detectChanges();
        const searchResult = de.queryAll(By.css("bl-table bl-row-render")).map(t => t.nativeElement.textContent);
        expect(searchResult[0]).toContain("a1 v2");
        expect(searchResult[1]).toContain("a2 v2");
        expect(searchResult[2]).toContain("a4 v2");
        expect(searchResult[3]).toContain("a8 v2");
        expect(searchResult[4]).toContain("a2m v2");
        expect(searchResult[5]).toContain("a4m v2");
        expect(searchResult[6]).toContain("a8m v2");
    });

    it("Should show all vm with no searchName presents", () => {
        component.onFilterChange({
            category: "all",
            searchName: "",
        });
        fixture.detectChanges();
        const searchResult = de.queryAll(By.css("bl-table bl-row-render")).map(t => t.nativeElement.textContent);
        expect(searchResult.length).toEqual(iaasVms.length);
    });

    it("should select the size if click on it", () => {
        component.pickSize("Standard_A2");
        fixture.detectChanges();
        expect(testComponent.vmSize).toEqual("Standard_A2");
    });
});
