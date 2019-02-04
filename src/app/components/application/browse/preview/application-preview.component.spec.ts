import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BatchApplication } from "app/models";
import { ApplicationPreviewComponent } from "./application-preview.component";

@Component({
    template: `<bl-application-preview [application]="application"></bl-application-preview>`,
})
class TestComponent {
    public application = new BatchApplication({
        id: "/subs/sub-1/acc/acc-1/applications/app-1",
        name: "app-1",
        properties: { allowUpdates: true } as any,
    });
}

describe("ApplicationPreviewComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ApplicationPreviewComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-application-preview"));
        fixture.detectChanges();
    });

    describe("application unlocked", () => {
        beforeEach(() => {
            testComponent.application = new BatchApplication({
                id: "/subs/sub-1/acc/acc-1/applications/app-1",
                name: "app-1",
                properties: { allowUpdates: true } as any,
            });
            fixture.detectChanges();
        });

        it("unlock icon displayed", () => {
            const element = de.query(By.css(".success")).nativeElement;
            expect(element).toBeDefined();
            expect(element.attributes["matTooltip"].value).toBe("Application allows updates");
        });

        it("lock icon not displayed", () => {
            const container = de.query(By.css(".failure"));
            expect(container).toBeNull();
        });
    });

    describe("application locked", () => {
        beforeEach(() => {
            testComponent.application = new BatchApplication({
                id: "/subs/sub-1/acc/acc-1/applications/app-1",
                name: "app-1",
                properties: { allowUpdates: false } as any,
            });
            fixture.detectChanges();
        });

        it("unlock icon not displayed", () => {
            const container = de.query(By.css(".success"));
            expect(container).toBeNull();
        });

        it("lock icon displayed", () => {
            const element = de.query(By.css(".failure")).nativeElement;
            expect(element).toBeDefined();
            expect(element.attributes["matTooltip"].value).toBe("Application is locked");
        });
    });
});
