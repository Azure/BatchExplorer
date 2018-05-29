import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { PoolNodesPreviewComponent } from "app/components/pool/base";
import { Pool } from "app/models";

@Component({
    template: `<bl-pool-nodes-preview [pool]="pool"></bl-pool-nodes-preview>`,
})
class TestComponent {
    public pool: Pool = new Pool({});
}

describe("PoolNodesPreviewComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PoolNodesPreviewComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-nodes-preview"));
        fixture.detectChanges();
    });

    describe("when pool is steady", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                allocationState: "steady",
                currentDedicatedNodes: 4, targetDedicatedNodes: 4,
                currentLowPriorityNodes: 1, targetLowPriorityNodes: 1,
            });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("5");
            expect((text.match(/5/g) || []).length).toBe(1, "Should only have one 5 in the content");
        });

        it("should not show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).not.toContain("→");
        });
    });

    describe("when pool is resizing", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                allocationState: "resizing",
                currentDedicatedNodes: 2, targetDedicatedNodes: 8,
                currentLowPriorityNodes: 1, targetLowPriorityNodes: 1,
            });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("3");
            expect(text).toContain("9");
        });

        it("should show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("→");
        });
    });

    describe("when there is a resize error", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                allocationState: "steady",
                currentDedicatedNodes: 2, targetDedicatedNodes: 8,
                currentLowPriorityNodes: 1, targetLowPriorityNodes: 1,
                resizeErrors: [{ code: "StoppedResize" }] as any,
            });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("3");
            expect(text).toContain("9");
        });

        it("should show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("→");
        });

        it("Should have the resize error class", () => {
            expect(de.classes["resize-error"]).toBe(true);
        });
    });
});
