import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Theme, ThemeDefinition, ThemeService } from "app/services";
import * as React from "react";
import { BehaviorSubject } from "rxjs";
import { waitFor } from "@testing-library/react";
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

    afterEach(() => {
        themeSubject.next(undefined);
        testComponent.ngOnDestroy();
        fixture.destroy();
    });

    function getRootEl() {
        const el =  fixture.debugElement.query(By.css(".react-root")).nativeElement;
        if (!el) {
            throw new Error("Root element not found");
        }
        return el;
    }

    function getChildText() {
        const rootEl = getRootEl();
        if (rootEl.children.length === 0) {
            throw new Error("No children found");
        }
        return rootEl.children[0].textContent;
    }

    it("can render a simple react component", async () => {
        themeSubject.next(testTheme);

        testComponent.component = SimpleMessage;
        testComponent.props = {
            message: "Hello world!"
        };
        fixture.detectChanges();
        await fixture.whenStable();

        const rootEl = await waitFor(getRootEl);
        expect(rootEl.tagName).toEqual("DIV");

        const childText = await waitFor(getChildText);
        expect(childText).toEqual("Hello world!");
    });

    it("waits for theme to load before rendering", async () => {
        testComponent.component = SimpleMessage;
        testComponent.props = {
            message: "Hello world!!"
        };
        fixture.detectChanges();
        await fixture.whenStable();
        expect(() => getRootEl()).toThrowError();

        themeSubject.next(testTheme);
        fixture.detectChanges();
        await fixture.whenStable();

        const childText = await waitFor(getChildText);
        expect(childText).toEqual("Hello world!!");
    });

});
