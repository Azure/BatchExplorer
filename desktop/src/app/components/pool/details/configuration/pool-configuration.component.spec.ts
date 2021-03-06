import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClipboardService } from "@batch-flask/electron";
import {
    BoolPropertyComponent, NoItemComponent, SidebarManager, TextPropertyComponent,
} from "@batch-flask/ui";
import { NodeFillType, Pool } from "app/models";
import { PoolService } from "app/services";
import { PoolConfigurationComponent } from "./pool-configuration.component";

@Component({
    template: `<bl-pool-configuration [pool]="pool"></bl-pool-configuration>`,
})
class TestComponent {
    public pool: Pool;
}

describe("PoolConfigurationComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [
                PoolConfigurationComponent, TestComponent, NoItemComponent,
                TextPropertyComponent, BoolPropertyComponent,
            ],
            providers: [
                { provide: SidebarManager, useValue: null },
                { provide: PoolService, useValue: null },
                { provide: ClipboardService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-configuration"));
        fixture.detectChanges();
    });

    it("display task scheduling policy", () => {
        testComponent.pool = new Pool({
            taskSchedulingPolicy: {
                nodeFillType: NodeFillType.spread,
            },
        });
        fixture.detectChanges();
        const property = de.query(By.css("bl-text-property[label='Task scheduling policy']"));
        expect(property.nativeElement.textContent).toContain(NodeFillType.spread);
    });
});
