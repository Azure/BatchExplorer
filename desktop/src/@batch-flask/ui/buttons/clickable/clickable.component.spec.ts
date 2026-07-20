import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, getTestBed, tick } from "@angular/core/testing";
import { provideLocationMocks } from "@angular/common/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { provideRouter, Router, RouterModule } from "@angular/router";
import { KeyCode } from "@batch-flask/core/keys";
import { click, keydown } from "test/utils/helpers";
import { ClickableComponent } from "./clickable.component";

/* eslint-disable @angular-eslint/component-class-suffix */

describe("ClickableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let router: Router;

    function setup(comp) {
        TestBed.configureTestingModule({
            imports: [BrowserModule, RouterModule],
            declarations: [ClickableComponent, comp],
            providers: [
                provideRouter([
                    { path: "", component: comp },
                    { path: "some/other", component: comp },
                ]),
                provideLocationMocks(),
            ],
        });
        fixture = TestBed.createComponent(comp);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-clickable"));
        fixture.detectChanges();
        const injector = getTestBed();
        router = injector.inject(Router);
    }

    it("when routerlink provided it trigger it", async () => {
        setup(ClickableWithRouterLinkOnSelf);
        click(de);
        await fixture.whenStable();
        expect(testComponent.trigger).toHaveBeenCalledOnce();
        expect(router.url).toBe("/some/other");
    });

    it("when router link on parent component it doesn't trigger it", fakeAsync(() => {
        setup(ClickableWithRouterLinkOnParent);
        click(de);
        tick();

        expect(testComponent.trigger).toHaveBeenCalledOnce();
        expect(router.url).toBe("/");
    }));

    it("doesn't trigger when disabled", () => {
        setup(ClickableWithRouterLinkOnSelf);
        testComponent.disabled = true;
        fixture.detectChanges();
        click(de);
        expect(testComponent.trigger).not.toHaveBeenCalled();
    });

    it("triggers through 'Enter' key", fakeAsync(() => {
        setup(ClickableWithRouterLinkOnSelf);
        keydown(de, KeyCode.Enter);
        tick();
        expect(testComponent.trigger).toHaveBeenCalledOnce();
    }));
});

class TestComponent {
    public disabled = false;
    public trigger: jasmine.Spy;

    constructor() {
        this.trigger = jasmine.createSpy("trigger");
    }
}

@Component({
    standalone: false,
    template: `
        <div [routerLink]="['some', 'other']">
            <bl-clickable [disabled]="disabled" (do)="trigger()"></bl-clickable>
        </div>`,
})
class ClickableWithRouterLinkOnParent extends TestComponent {
}

@Component({
    standalone: false,
    template: `
        <bl-clickable [disabled]="disabled" [routerLink]="['/some', 'other']" (do)="trigger()"></bl-clickable>
    `,
})
class ClickableWithRouterLinkOnSelf extends TestComponent {
}
