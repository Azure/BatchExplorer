import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Theme, ThemeDefinition, ThemeService } from "app/services";
import * as React from "react";
import { BehaviorSubject } from "rxjs";
import { ReactContainerComponent } from "./react-container.component";

interface SimpleMessageProps {
    message?: string
}

const SimpleMessage: React.FC<SimpleMessageProps> = props => {
    return React.createElement("span", null, `${props.message}`);
};

const testTheme = new Theme("testTheme", {
    "chart-colors": [
        "#003f5c",
        "#aa3939",
        "#4caf50",
        "#ffa600",
    ],
} as Partial<ThemeDefinition> as any);

describe("ReactContainerComponent", () => {
    let fixture: ComponentFixture<ReactContainerComponent<unknown>>;
    let testComponent: ReactContainerComponent<unknown>;
    const themeSubject: BehaviorSubject<Theme | undefined> = new BehaviorSubject(undefined);

    beforeEach(() => {
        const themeServiceSpy = {
            currentTheme: themeSubject,
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ReactContainerComponent],
            providers: [{ provide: ThemeService, useValue: themeServiceSpy },],
        });
        fixture = TestBed.createComponent(ReactContainerComponent);
        testComponent = fixture.componentInstance;
    });

    function getRootEl() {
        return fixture.debugElement.query(By.css(".react-root"));
    }

    it("can render a simple react component", () => {
        themeSubject.next(testTheme);

        testComponent.component = SimpleMessage;
        testComponent.props = {
            message: "Hello world!"
        };
        fixture.detectChanges();

        expect(getRootEl()).toBeTruthy();

        const rootEl: HTMLDivElement = getRootEl().nativeElement;
        expect(rootEl).toBeDefined();
        expect(rootEl.tagName).toEqual("DIV");
        expect(rootEl.children[0]).toBeDefined();
        expect(rootEl.children[0].textContent).toEqual("Hello world!");
    });

    it("waits for theme to load before rendering", () => {
        testComponent.component = SimpleMessage;
        testComponent.props = {
            message: "Hello world!"
        };

        expect(getRootEl()).toBeNull();

        themeSubject.next(testTheme);
        fixture.detectChanges();
        expect(getRootEl()).toBeTruthy();
        expect(getRootEl().nativeElement.children[0].textContent).toEqual("Hello world!");

    });

});
