import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { LocationComponent } from "./location.component";

@Component({
    template: `<bl-location [location]="location"></bl-location>`,
})
class TestComponent {
    public location: string;
}

describe("LocationComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [LocationComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-location"));
        fixture.detectChanges();
    });

    it("show region", () => {
        testComponent.location = "eastus2";
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("eastus2");
    });

    it("show us flag for centralus", () => {
        testComponent.location = "centralus";
        fixture.detectChanges();
        expect(de.query(By.css(".flag-icon-us"))).not.toBeFalsy();
        expect(de.query(By.css(".fa-globe"))).toBeFalsy();
    });

    it("show french flag for francesouth", () => {
        testComponent.location = "francesouth";
        fixture.detectChanges();

        expect(de.query(By.css(".flag-icon-fr"))).not.toBeFalsy();
        expect(de.query(By.css(".fa-globe"))).toBeFalsy();
    });

    it("show uk flag for ukwest", () => {
        testComponent.location = "ukwest";
        fixture.detectChanges();
        expect(de.query(By.css(".flag-icon-gb"))).not.toBeFalsy();
        expect(de.query(By.css(".fa-globe"))).toBeFalsy();
    });

    it("show singapor flag for southeastasia", () => {
        testComponent.location = "southeastasia";
        fixture.detectChanges();
        expect(de.query(By.css(".flag-icon-sg"))).not.toBeFalsy();
        expect(de.query(By.css(".fa-globe"))).toBeFalsy();
    });

    it("show globefor unkown location", () => {
        testComponent.location = "somenewloc";
        fixture.detectChanges();
        expect(de.query(By.css(".fa-globe"))).not.toBeFalsy();
        expect(de.query(By.css(".flag-icon"))).toBeFalsy();
    });
});
