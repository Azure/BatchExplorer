import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ProfileButtonComponent } from "./profile-button.component";

@Component({
    template: `<bl-profile-button></bl-profile-button>`,
})
class TestComponent {
}

fdescribe("profile-button", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ProfileButtonComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ProfileButtonComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-profile-button"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
