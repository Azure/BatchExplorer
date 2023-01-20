import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ClickableComponent } from "../buttons";
import { VTabGroupComponent } from "./vtab-group.component";
import { VTabComponent } from "./vtab.component";

const tabDefs = [
    { label: "Details", content: "This has some content" },
    { label: "Custom", content: "Something else is happening" },
];

/* eslint-disable  */
@Component({
    template: `
        <bl-vtab-group>
            <bl-vtab *ngFor="let tab of tabs">
                <div tabLabel>
                    {{tab.label}}
                </div>
                {{tab.content}}
            </bl-vtab>
        </bl-vtab-group>
    `,
})
class TestComponent {
    public tabs: Array<{ label: string, content: string }> = [];
}

describe("VTabGroupComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [VTabGroupComponent, VTabComponent, TestComponent, ClickableComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-vtab-group"));
        fixture.detectChanges();
    });

    it("doesn't fail if there is no tabs", () => {
        testComponent.tabs = [];
        fixture.detectChanges();
        expect(de.queryAll(By.css(".tab-navigation-item")).length).toEqual(0);
        expect(de.query(By.css(".tab-content"))).toBeFalsy();
    });

    it("focus the first tab automatically", () => {
        testComponent.tabs = tabDefs;
        fixture.detectChanges();

        const tabs = de.queryAll(By.css(".tab-navigation-item"));
        expect(tabs.length).toEqual(2);
        expect(tabs[0].nativeElement.textContent).toContain("Details");
        expect(tabs[1].nativeElement.textContent).toContain("Custom");

    });

    it("focus the first tab automatically", () => {
        testComponent.tabs = tabDefs;
        fixture.detectChanges();

        expect(de.queryAll(By.css(".tab-navigation-item")).length).toEqual(2);
        const content = de.query(By.css(".tab-content"));
        expect(content).not.toBeFalsy();
        expect(content.nativeElement.textContent).toContain("This has some content");
    });
});
