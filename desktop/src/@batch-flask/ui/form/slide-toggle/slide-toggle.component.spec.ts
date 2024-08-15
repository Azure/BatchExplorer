import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { By } from "@angular/platform-browser";
import { SlideToggleComponent } from "./slide-toggle.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("SlideToggleComponent", () => {
    let component: SlideToggleComponent;
    let fixture: ComponentFixture<SlideToggleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SlideToggleComponent],
            imports: [FormsModule, MatSlideToggleModule, NoopAnimationsModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SlideToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should toggle checked state", () => {
        const slideToggle = fixture.debugElement.query(By.css("mat-slide-toggle"));
        slideToggle.triggerEventHandler("change", { checked: true });
        fixture.detectChanges();
        expect(component.checked).toBe(true);

        slideToggle.triggerEventHandler("change", { checked: false });
        fixture.detectChanges();
        expect(component.checked).toBe(false);
    });

    it("should emit toggleChange event", () => {
        spyOn(component.toggleChange, "emit");
        const slideToggle = fixture.debugElement.query(By.css("mat-slide-toggle"));
        slideToggle.triggerEventHandler("change", { checked: true });
        fixture.detectChanges();
        expect(component.toggleChange.emit).toHaveBeenCalledWith(true);

        slideToggle.triggerEventHandler("change", { checked: false });
        fixture.detectChanges();
        expect(component.toggleChange.emit).toHaveBeenCalledWith(false);
    });

    it("should disable the slide toggle", () => {
        component.isDisabled = true;
        fixture.detectChanges();
        const slideToggle = fixture.debugElement.query(By.css("mat-slide-toggle"));
        expect(slideToggle.attributes["ng-reflect-disabled"]).toBe("true");
    });

    it("should call registerOnChange", () => {
        const fn = jasmine.createSpy("onChangeCallback");
        component.registerOnChange(fn);
        component.valueChange(true);
        expect(fn).toHaveBeenCalledWith(true);
    });
});
