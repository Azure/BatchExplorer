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
    let component: PoolNodesPreviewComponent;
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
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("when pool is steady", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({ state: "steady", currentDedicated: 4, targetDedicated: 4 });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("4");
            expect((text.match(/4/g) || []).length).toBe(1, "Should only have one 4 in the content");
        });

        it("should not show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).not.toContain("⇾");
        });
    });

    describe("when pool is resizing", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({ state: "resizing", currentDedicated: 2, targetDedicated: 8 });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("2");
            expect(text).toContain("8");
        });

        it("should show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("⇾");
        });
    });

    describe("when there is a resize error", () => {
        beforeEach(() => {
            testComponent.pool = new Pool({
                state: "steady", currentDedicated: 2, targetDedicated: 8,
                resizeError: { code: "StoppedResize" } as any,
            });
            fixture.detectChanges();
        });

        it("should just show the current dedicated", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("2");
            expect(text).toContain("8");
        });

        it("should show the arrow", () => {
            const text = de.nativeElement.textContent;
            expect(text).toContain("⇾");
        });

        it("Should have the resize error class", () => {
            expect(de.classes["resize-error"]).toBe(true);
        });
    });
});
