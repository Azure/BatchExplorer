import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, inject } from "@angular/core/testing";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { AppTestComponent, FakeComponent, setupSidebarTest } from "./sidebar-spec-helper.spec";

describe("SidebarPageComponent", () => {
    let component: AppTestComponent;
    let sidebarManager: SidebarManager;
    let fixture: ComponentFixture<AppTestComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(() => {
        setupSidebarTest();
    });

    beforeEach(inject([SidebarManager], (d: SidebarManager) => {
        sidebarManager = d;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppTestComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;

        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it("should create a new component and display it", () => {
        sidebarManager.open("fake", FakeComponent);
        fixture.detectChanges();
        expect(el.textContent).toContain("Some component content");
        expect(component.sidebar.opened).toBe(true);
    });

    it("should reopen the same component if resetOnOpen is false", () => {
        const sidebarRef = sidebarManager.open("fake", FakeComponent);
        sidebarRef.component.text = "New component text";
        fixture.detectChanges();
        expect(el.textContent).toContain("New component text");
        expect(component.sidebar.opened).toBe(true);
        sidebarManager.close();
        expect(component.sidebar.opened).toBe(false);

        // This should now give the same reference.
        const newSidebarRef = sidebarManager.open("fake", FakeComponent);
        fixture.detectChanges();
        expect(newSidebarRef).toEqual(sidebarRef);
        expect(el.textContent).toContain("New component text");
        expect(component.sidebar.opened).toBe(true);
    });

    it("should reset the component if resetOnOpen is true", () => {
        const firstSidebarRef = sidebarManager.open("fake", FakeComponent);
        firstSidebarRef.component.text = "First component text";
        fixture.detectChanges();
        expect(el.textContent).toContain("First component text");
        sidebarManager.close();
        expect(component.sidebar.opened).toBe(false);

        // This should now give the same reference.
        const newSidebarRef = sidebarManager.open("fake", FakeComponent, true);
        fixture.detectChanges();

        // Should still have the same reference
        expect(newSidebarRef).toEqual(firstSidebarRef);

        // The text should be reset to the default
        expect(el.textContent).toContain("Some component content");
    });

    it("different ids should create different components", () => {
        const firstSidebarRef = sidebarManager.open("fake-1", FakeComponent);
        firstSidebarRef.component.text = "First component text";
        fixture.detectChanges();

        const secondSidebarRef = sidebarManager.open("fake-2", FakeComponent);
        secondSidebarRef.component.text = "Second component text";
        fixture.detectChanges();

        // Both component should be included
        expect(el.textContent).toContain("First component text");
        expect(el.textContent).toContain("Second component text");

        // Only the 2nd one is being displayed
        expect(firstSidebarRef.page.display).toBe(false);
        expect(secondSidebarRef.page.display).toBe(true);

        // Switchin to show the first one
        firstSidebarRef.reopen();
        expect(firstSidebarRef.page.display).toBe(true);
        expect(secondSidebarRef.page.display).toBe(false);

        // Destroy
        firstSidebarRef.destroy();
        fixture.detectChanges();
        expect(el.textContent).not.toContain("First component text");
        expect(el.textContent).toContain("Second component text");
        expect(sidebarManager.sidebar.opened).toBe(false);
    });

    it("Should notifiy afterCompletion when the sidebar is destroyed", () => {
        const firstSidebarRef = sidebarManager.open("fake-1", FakeComponent);
        const spy = jasmine.createSpy("afterCompletion");

        firstSidebarRef.afterCompletion.subscribe(spy);
        firstSidebarRef.destroy("some result");

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith("some result");
    });
});
