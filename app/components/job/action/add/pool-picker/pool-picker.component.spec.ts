import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule, I18nUIModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { PoolPickerComponent } from "app/components/job/action/add";
import { CloudServiceOsFamily, Pool } from "app/models";
import { PoolOsService, PoolService, VmSizeService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";
import { click, updateInput } from "test/utils/helpers";
import { MockListView } from "test/utils/mocks";

@Component({
    template: `<bl-pool-picker [formControl]="poolInfo"></bl-pool-picker>`,
})
class TestComponent {
    public poolInfo = new FormControl({});
}

const centosVM = {
    imageReference: { publisher: "openlogic", offer: "centos", sku: "7.3", version: "*" },
    nodeAgentId: "batch.centos",
};

const ubuntuVM = {
    imageReference: { publisher: "cannonical", offer: "ubuntu", sku: "16.04", version: "*" },
    nodeAgentId: "batch.ubuntu",
};

const windowsVM = {
    imageReference: { publisher: "cannonical", offer: "windows", sku: "2016", version: "*" },
    nodeAgentId: "batch.windows",
};

const centosPool1 = new Pool({
    id: "centos-pool-1", vmSize: "standard_a2",
    targetDedicatedNodes: 3, virtualMachineConfiguration: centosVM,
});
const centosPool2 = new Pool({
    id: "centos-pool-2", vmSize: "standard_a2",
    targetDedicatedNodes: 1, virtualMachineConfiguration: centosVM,
});
const ubuntuPool = new Pool({
    id: "ubuntu-pool-1", vmSize: "standard_a2",
    targetDedicatedNodes: 19, virtualMachineConfiguration: ubuntuVM,
});
const windowsPool = new Pool({
    id: "windows-pool-1", vmSize: "standard_a2",
    targetDedicatedNodes: 43, virtualMachineConfiguration: windowsVM,
});
const cloudServicePool = new Pool({
    id: "windows-cloudservice-pool-1", vmSize: "standard_a2",
    targetDedicatedNodes: 12,
    cloudServiceConfiguration: {
        osFamily: CloudServiceOsFamily.windowsServer2016,
    },
});

describe("PoolPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let poolServiceSpy;
    let vmSizeServiceSpy;
    let poolOsServiceSpy;

    beforeEach(() => {
        poolServiceSpy = {
            listView: () => new MockListView(Pool, {
                items: [centosPool1, centosPool2, ubuntuPool, windowsPool, cloudServicePool],
            }),
        };
        vmSizeServiceSpy = {
            sizes: of(List([])),
        };
        poolOsServiceSpy = {
            offers: new BehaviorSubject({
                allOffers: [
                    { name: "centos" },
                    { name: "ubuntu" },
                    { name: "windows" },
                ],
            }),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, ButtonsModule, I18nTestingModule, I18nUIModule],
            declarations: [PoolPickerComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: VmSizeService, useValue: vmSizeServiceSpy },
                { provide: PoolOsService, useValue: poolOsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-picker"));
        fixture.detectChanges();
    });

    it("should list all the pools", () => {
        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(5);
        expect(pools[0].query(By.css(".title")).nativeElement.textContent).toContain("centos-pool-1");
        expect(pools[0].query(By.css(".details")).nativeElement.textContent).toContain("3");
        expect(pools[1].query(By.css(".title")).nativeElement.textContent).toContain("centos-pool-2");
        expect(pools[1].query(By.css(".details")).nativeElement.textContent).toContain("1");
        expect(pools[2].query(By.css(".title")).nativeElement.textContent).toContain("ubuntu-pool-1");
        expect(pools[2].query(By.css(".details")).nativeElement.textContent).toContain("19");
        expect(pools[3].query(By.css(".title")).nativeElement.textContent).toContain("windows-pool-1");
        expect(pools[3].query(By.css(".details")).nativeElement.textContent).toContain("43");
        expect(pools[4].query(By.css(".title")).nativeElement.textContent).toContain("windows-cloudservice-pool-1");
        expect(pools[4].query(By.css(".details")).nativeElement.textContent).toContain("12");
    });

    it("should select the pool when clicking on it", () => {
        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(5);
        click(pools[1]);
        fixture.detectChanges();
        expect(testComponent.poolInfo.value).toEqual({ poolId: "centos-pool-2" });
        expect(pools[1].classes["active"]).toBe(true);

    });

    it("update the active pool from the parent", () => {
        testComponent.poolInfo.setValue({ poolId: "ubuntu-pool-1" });
        fixture.detectChanges();
        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(5);
        expect(pools[2].classes["active"]).toBe(true);
    });

    it("select is listed with all offers", () => {
        const select: SelectComponent = de.query(By.css("bl-select")).componentInstance;
        const options = select.options.toArray();
        expect(options.length).toBe(5);
        expect(options[0].label).toEqual("No filter");
        expect(options[0].value).toEqual(null);
        expect(options[1].label).toEqual("centos (2)");
        expect(options[1].value).toEqual("centos");
        expect(options[2].label).toEqual("ubuntu (1)");
        expect(options[2].value).toEqual("ubuntu");
        expect(options[3].label).toEqual("windows (1)");
        expect(options[3].value).toEqual("windows");
        expect(options[4].label).toEqual("Windows (Cloud service) (1)");
        expect(options[4].value).toEqual("cloudservice-windows");
    });

    it("filter by id", () => {
        const inputEl = de.query(By.css("input.search-input"));
        updateInput(inputEl, "entos");
        fixture.detectChanges();

        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(2);

        expect(pools[0].nativeElement.textContent).toContain("centos-pool-1");
        expect(pools[1].nativeElement.textContent).toContain("centos-pool-2");
    });

    it("filter by os", () => {
        const select: SelectComponent = de.query(By.css("bl-select")).componentInstance;
        select.selectOption(select.options.toArray()[2]); // Ubuntu option
        fixture.detectChanges();

        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(1);

        expect(pools[0].nativeElement.textContent).toContain("ubuntu-pool-1");
    });

    it("filter by os (cloudservice)", () => {
        const select: SelectComponent = de.query(By.css("bl-select")).componentInstance;
        select.selectOption(select.options.toArray()[4]); // Cloud service
        fixture.detectChanges();

        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(1);

        expect(pools[0].nativeElement.textContent).toContain("windows-cloudservice-pool-1");
    });
});
