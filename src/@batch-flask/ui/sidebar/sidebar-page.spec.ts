import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, inject } from "@angular/core/testing";
import { GlobalSidebarService, SidebarManager, SidebarPageComponent, SidebarRef } from "@batch-flask/ui/sidebar";

import { FakeComponent, setupSidebarTest } from "./sidebar-spec-helper.spec";

describe("SidebarPageComponent", () => {
    let component: SidebarPageComponent;
    let globalSidebarService: GlobalSidebarService;
    let fixture: ComponentFixture<SidebarPageComponent>;
    let onOpenSpy: jasmine.Spy;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(() => {
        setupSidebarTest();
        onOpenSpy = jasmine.createSpy("spy");
    });

    beforeEach(inject([SidebarManager], (d: GlobalSidebarService) => {
        globalSidebarService = d;
        globalSidebarService.sidebar = {
            onOpen: {
                subscribe: onOpenSpy,
            },
        } as any;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarPageComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;

        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it("should be displayed by default", () => {
        fixture.detectChanges();
        expect(component.display).toBe(true);
    });

    it("#hide() should hide the componenet", () => {
        component.hide();
        fixture.detectChanges();
        expect(component.display).toBe(false);
    });

    it("#attachComponent() attach the component correctly", () => {
        const sidebarRef = new SidebarRef(null, "id-1");
        component.attachComponent(FakeComponent, sidebarRef);
        fixture.detectChanges();
        expect(el.textContent).toContain("Some component content");
    });
});
