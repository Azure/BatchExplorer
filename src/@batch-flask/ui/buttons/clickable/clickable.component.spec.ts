import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { ClickableComponent } from "./clickable.component";

@Component({
    template: `
        <div [routerLink]="['some', 'other']">
            <bl-clickable></bl-clickable>
        </div>`,
})
class TestComponent {
}

fdescribe("ClickableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ClickableComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ClickableComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-clickable"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("Works", () => {

    });
});
