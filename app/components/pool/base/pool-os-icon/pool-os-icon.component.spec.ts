import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { PoolOsIconComponent } from "./pool-os-icon.component";

@Component({
    template: `<bl-pool-os-icon></bl-pool-os-icon>`,
})
class TestComponent {
}

describe("PoolOsIconComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: PoolOsIconComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PoolOsIconComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-os-icon"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
