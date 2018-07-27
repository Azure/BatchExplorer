import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ChartDirective } from "@batch-flask/ui";
import { PoolNodeCountService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { ContextMenuServiceMock } from "test/utils/mocks";
import { PoolStateGraphComponent } from "./pool-state-graph.component";

@Component({
    template: `<bl-pool-state-graph></bl-pool-state-graph>`,
})
class TestComponent {
}

fdescribe("PoolStateGraphComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: PoolStateGraphComponent;
    let de: DebugElement;

    let contextMenuServiceSpy: ContextMenuServiceMock;
    let nodeCountServiceSpy;

    beforeEach(() => {
        contextMenuServiceSpy = new ContextMenuServiceMock();
        nodeCountServiceSpy = {
            counts: new BehaviorSubject(null),
            refresh: jasmine.createSpy(),
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PoolStateGraphComponent, TestComponent, ChartDirective],
            providers: [
                contextMenuServiceSpy.asProvider(),
                { provide: PoolNodeCountService, useValue: nodeCountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-state-graph"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("show nothing if node counts are not loaded", () => {
    });
});
