import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ApplicationPreviewComponent } from "app/components/application/browse/preview";
import * as Fixtures from "test/fixture";

describe("ApplicationPreviewComponent", () => {
    let fixture: ComponentFixture<ApplicationPreviewComponent>;
    let component: ApplicationPreviewComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ApplicationPreviewComponent],
            providers: [],
        });

        fixture = TestBed.createComponent(ApplicationPreviewComponent);
        component = fixture.componentInstance;
        component.application = Fixtures.application.create();
        fixture.detectChanges();
    });

    describe("application unlocked", () => {
        beforeEach(() => {
            component.application = Fixtures.application.create({ allowUpdates: true });
            fixture.detectChanges();
        });

        it("unlock icon displayed", () => {
            const element = fixture.debugElement.query(By.css(".success")).nativeElement;
            expect(element).toBeDefined();
            expect(element.attributes["matTooltip"].value).toBe("Application allows updates");
        });

        it("lock icon not displayed", () => {
            const container = fixture.debugElement.query(By.css(".failure"));
            expect(container).toBeNull();
        });
    });

    describe("application locked", () => {
        beforeEach(() => {
            component.application = Fixtures.application.create({ allowUpdates: false });
            fixture.detectChanges();
        });

        it("unlock icon not displayed", () => {
            const container = fixture.debugElement.query(By.css(".success"));
            expect(container).toBeNull();
        });

        it("lock icon displayed", () => {
            const element = fixture.debugElement.query(By.css(".failure")).nativeElement;
            expect(element).toBeDefined();
            expect(element.attributes["matTooltip"].value).toBe("Application is locked");
        });
    });
});
