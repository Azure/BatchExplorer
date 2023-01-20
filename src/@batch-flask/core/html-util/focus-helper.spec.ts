import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { focusWithin } from "./focus-helper";

@Component({
    template: `
<div id="container">
    <span></span>
    <input/>
    <div></div>
</div>
    `
}) class TestComponent { }

describe("focus-helper", () => {
    describe("focusWithin", () => {
        let fixture: ComponentFixture<TestComponent>;
        let container, children;

        const expectContainerFocus = el => {
            focusWithin(container);
            expect(document.activeElement).toEqual(el);
        };

        beforeEach(() => {
            TestBed.configureTestingModule({
                declarations: [TestComponent]
            });

            fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();

            container = fixture.debugElement.query(By.css("#container"))
                .nativeElement;
            children = container.childNodes;
        });
        it("focuses on the first interactive element", () => {
            expect(document.activeElement).toEqual(document.body);

            expectContainerFocus(children[1]);
        });
        it("focuses on an element whose tabindex is 0", () => {
            children[0].tabIndex = 0;
            expectContainerFocus(children[0]);
        });

        it("skips invisible elements", () => {
            children[2].tabIndex = 0;
            expectContainerFocus(children[1]);

            children[1].style.display = "none";
            expectContainerFocus(children[2]);

            children[1].style.display = null;
            children[1].style.visibility = "hidden";
            expectContainerFocus(children[2]);

            children[1].style.visibility = "visible";
            children[1].style.opacity = 0;
            expectContainerFocus(children[2]);

            children[1].style.opacity = 1;
            expectContainerFocus(children[1]);
        });

        it("skips disabled elements", () => {
            expectContainerFocus(children[1]);
            children[1].setAttribute("disabled", true);
            children[2].tabIndex = 0;
            expectContainerFocus(children[2]);
        })
    });
});
