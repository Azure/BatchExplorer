import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, getTestBed, tick } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { click } from "test/utils/helpers";
import { ClickableComponent } from "./clickable.component";

// tslint:disable:component-class-suffix

describe("ClickableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let router: Router;

    function setup(comp) {
        TestBed.configureTestingModule({
            imports: [BrowserModule, RouterTestingModule.withRoutes([
                { path: "", component: comp },
                { path: "some/other", component: comp },
            ])],
            declarations: [ClickableComponent, comp],
        });
        fixture = TestBed.createComponent(comp);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-clickable"));
        fixture.detectChanges();
        const injector = getTestBed();
        router = injector.get(Router);
    }

    it("when routerlink provided it trigger it", fakeAsync(() => {
        setup(ClickableWithRouterLinkOnSelf);
        click(de);
        tick();
        expect(testComponent.trigger).toHaveBeenCalledOnce();
        expect(router.url).toBe("/some/other");
    }));

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
});

class TestComponent {
    public disabled = false;
    public trigger: jasmine.Spy;

    constructor() {
        this.trigger = jasmine.createSpy("trigger");
    }
}

@Component({
    template: `
        <div [routerLink]="['some', 'other']">
            <bl-clickable [disabled]="disabled" (do)="trigger()"></bl-clickable>
        </div>`,
})
class ClickableWithRouterLinkOnParent extends TestComponent {
}

@Component({
    template: `
        <bl-clickable [disabled]="disabled" [routerLink]="['/some', 'other']" (do)="trigger()"></bl-clickable>
    `,
})
class ClickableWithRouterLinkOnSelf extends TestComponent {
}
