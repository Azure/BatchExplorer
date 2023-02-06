import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule } from "../buttons";
import { DropdownComponent } from "./dropdown.component";

describe("DropdownComponent", () => {
    let fixture: ComponentFixture<Component>;

    function createComponent(comp: Type<Component>) {
        TestBed.configureTestingModule({
            imports: [FormsModule, ButtonsModule, I18nTestingModule],
            declarations: [DropdownComponent, comp],
        });
        fixture = TestBed.createComponent(comp);
        fixture.detectChanges();
    }

    function $(selector) {
        return fixture.debugElement.query(By.css("bl-dropdown"))
            .nativeElement.querySelector(selector);
    }

    it("uses a default title", () => {
        createComponent(TestComponent);

        expect($(".dropdown-btn-container").getAttribute("title"))
            .toEqual("dropdown.button-title");
    });
    it("uses a host button title", () => {
        createComponent(TestComponentWithButton);

        expect($(".dropdown-btn-container").getAttribute("title"))
            .toEqual("Host title");
    });
});

@Component({ template: `<bl-dropdown [title]="title"></bl-dropdown>` })
class TestComponent { }

@Component({
    template: `<bl-dropdown [title]="title">
        <div bl-dropdown-btn button-title="Host title">Button</div>
    </bl-dropdown>`
})
class TestComponentWithButton { }
