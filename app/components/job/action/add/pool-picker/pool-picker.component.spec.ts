import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { SelectModule } from "@batch-flask/ui";
import { PoolPickerComponent } from "app/components/job/action/add";
import { Pool } from "app/models";
import { PoolOsService, PoolService, VmSizeService } from "app/services";
import { click } from "test/utils/helpers";
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

const pool1 = new Pool({
    id: "pool-1", vmSize: "standard_a2",
    targetDedicatedNodes: 3, virtualMachineConfiguration: centosVM,
});
const pool2 = new Pool({
    id: "pool-2", vmSize: "standard_a2",
    targetDedicatedNodes: 1, virtualMachineConfiguration: centosVM,
});
const pool3 = new Pool({
    id: "pool-3", vmSize: "standard_a2",
    targetDedicatedNodes: 19, virtualMachineConfiguration: ubuntuVM,
});

fdescribe("PoolPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let poolServiceSpy;
    let vmSizeServiceSpy;
    let poolOsServiceSpy;

    beforeEach(() => {
        poolServiceSpy = {
            listView: () => new MockListView(Pool, {
                items: [pool1, pool2, pool3],
            }),
        };
        vmSizeServiceSpy = {
            sizes: Observable.of(List([])),
        };
        poolOsServiceSpy = {
            offers: new BehaviorSubject({
                allOffers: [],
            }),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule],
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
        expect(pools.length).toBe(3);
        expect(pools[0].query(By.css(".title")).nativeElement.textContent).toContain("pool-1");
        expect(pools[0].query(By.css(".details")).nativeElement.textContent).toContain("3");
        expect(pools[1].query(By.css(".title")).nativeElement.textContent).toContain("pool-2");
        expect(pools[1].query(By.css(".details")).nativeElement.textContent).toContain("1");
        expect(pools[2].query(By.css(".title")).nativeElement.textContent).toContain("pool-3");
        expect(pools[2].query(By.css(".details")).nativeElement.textContent).toContain("19");
    });

    it("should select the pool when clicking on it", () => {
        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(3);
        click(pools[1]);
        fixture.detectChanges();
        expect(testComponent.poolInfo.value).toEqual({ poolId: "pool-2" });
        expect(pools[1].classes["active"]).toBe(true);

    });

    it("update the active pool from the parent", () => {
        testComponent.poolInfo.setValue({ poolId: "pool-3" });
        fixture.detectChanges();
        // await fixture.whenStable();
        // fixture.detectChanges();
        const pools = de.queryAll(By.css(".pool-list .pool"));
        expect(pools.length).toBe(3);
        expect(pools[2].classes["active"]).toBe(true);
    });
});
