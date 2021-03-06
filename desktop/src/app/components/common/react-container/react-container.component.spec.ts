import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import * as React from "react";
import { ReactContainerComponent } from "./react-container.component";

interface SimpleMessageProps {
    message?: string
}

const SimpleMessage: React.FC<SimpleMessageProps> = props => {
    return React.createElement("span", null, `${props.message}`);
};

describe("ReactContainerComponent", () => {
    let fixture: ComponentFixture<ReactContainerComponent<unknown>>;
    let testComponent: ReactContainerComponent<unknown>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ReactContainerComponent],
            providers: [],
        });
        fixture = TestBed.createComponent(ReactContainerComponent);
        testComponent = fixture.componentInstance;
    });

    function getRootEl() {
        return fixture.debugElement.query(By.css(".react-root"));
    }

    it("can render a simple react component", () => {
        testComponent.component = SimpleMessage;
        testComponent.props = {
            message: "Hello world!"
        };
        fixture.detectChanges();

        const rootEl: HTMLDivElement = getRootEl().nativeElement;
        expect(rootEl).toBeDefined();
        expect(rootEl.tagName).toEqual("DIV");
        expect(rootEl.children[0]).toBeDefined();
        expect(rootEl.children[0].textContent).toEqual("Hello world!");
    });
});
