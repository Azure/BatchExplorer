import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { ListSelection } from "@batch-flask/core/list";
import { AbstractListBaseConfig } from "@batch-flask/ui/abstract-list";
import { BreadcrumbModule } from "@batch-flask/ui/breadcrumbs";
import {
    ContextMenuItem, ContextMenuSeparator, ContextMenuService, MultiContextMenuItem,
} from "@batch-flask/ui/context-menu";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import {
    QuickListComponent,
    QuickListItemStatusComponent,
} from "@batch-flask/ui/quick-list";
import { VirtualScrollTestingModule } from "@batch-flask/ui/testing";
import { ButtonClickEvents, click, rightClick, sendEvent } from "test/utils/helpers";
import { ContextMenuServiceMock } from "test/utils/mocks";
import {
    QuickListRowExtraDirective,
    QuickListRowStateDirective,
    QuickListRowStatusDirective,
    QuickListRowTitleDirective,
} from "./quick-list-row-def";
import { QuickListRowRenderComponent } from "./quick-list-row-render";

interface TestItem {
    id: string;
    name: string;
}
// tslint:disable:trackBy-function
@Component({
    template: `
        <div style="height: 1000px">
            <bl-quick-list id="quick-1" [data]="items" [config]="config">
                <ng-container *blQuickListRowTitle="let item">{{item.name}}</ng-container>
            </bl-quick-list>
        </div>
    `,
})
class TestComponent {
    public config: AbstractListBaseConfig = {

    };
    public items: Iterable<TestItem> = [
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "AItem 2" },
        { id: "item-3", name: "Item 3" },
        { id: "item-5", name: "Item 5" },
        { id: "item-4", name: "BItem 4" },
    ];
}

fdescribe("QuickListComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let quicklist: QuickListComponent;
    let items: DebugElement[];

    let activeItemKey: string = null;
    let selection: ListSelection;
    let contextMenuServiceSpy: ContextMenuServiceMock;

    beforeEach(() => {
        contextMenuServiceSpy = new ContextMenuServiceMock();
        TestBed.configureTestingModule({
            imports: [BreadcrumbModule, RouterTestingModule, VirtualScrollTestingModule],
            declarations: [
                TestComponent, FocusSectionComponent,
                QuickListComponent,
                QuickListRowTitleDirective,
                QuickListRowRenderComponent,
                QuickListRowStatusDirective,
                QuickListRowStateDirective,
                QuickListRowExtraDirective,
                QuickListItemStatusComponent,
            ],
            providers: [
                { provide: ContextMenuService, useValue: contextMenuServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-quick-list"));
        quicklist = de.componentInstance;
        quicklist.activeItemChange.subscribe(x => activeItemKey = x);
        quicklist.selectionChange.subscribe(x => selection = x);
        fixture.detectChanges();
        items = de.queryAll(By.css("bl-quick-list-row-render"));
    });

    it("has the listbox role", () => {
        expect(de.attributes["role"]).toEqual("listbox");
    });

    it("has the multi selectable role", () => {
        expect(de.attributes["aria-multiselectable"]).toEqual("true");
    });

    it("has tabindex", () => {
        expect(de.attributes["tabindex"]).toEqual("0");
    });

    it("sets aria-setsize on each of the items", () => {
        for (const item of items) {
            expect(item.attributes["aria-setsize"]).toEqual("5");
        }
    });

    it("each row should have a unique id", () => {
        expect(items.length).toBe(5);
        expect(items[0].nativeElement.id).toEqual("quick-1-row-item-1");
        expect(items[1].nativeElement.id).toEqual("quick-1-row-item-2");
        expect(items[2].nativeElement.id).toEqual("quick-1-row-item-3");
        expect(items[3].nativeElement.id).toEqual("quick-1-row-item-4");
        expect(items[4].nativeElement.id).toEqual("quick-1-row-item-5");
    });

    it("should display all the content", () => {
        expect(items.length).toBe(5);
        expect(items[0].nativeElement.textContent).toContain("Item 1");
        expect(items[1].nativeElement.textContent).toContain("AItem 2");
        expect(items[2].nativeElement.textContent).toContain("Item 3");
        expect(items[4].nativeElement.textContent).toContain("Item 5");
        expect(items[3].nativeElement.textContent).toContain("BItem 4");
    });

    it("click on an item should make the item active", () => {
        click(items[1]);
        fixture.detectChanges();
        expect(activeItemKey).toEqual("item-2");
        expect(items[1].componentInstance.selected).toBe(true);

        expect(selection.keys.size).toBe(1, "Should also select the item");
        expect(selection.keys.has("item-2")).toBe(true, "Should also select the item");
    });

    it("click on an item should also focus it", () => {
        const item = items[1];

        click(item.nativeElement);
        fixture.detectChanges();
        expect(quicklist.focusedItem.id).toEqual("item-2");
        expect(de.attributes["aria-activedescendant"]).toEqual(`quick-1-row-item-2`);
    });

    it("show no items when data is not set", async () => {
        testComponent.items = undefined;
        fixture.detectChanges();
        await fixture.whenStable();
        items = de.queryAll(By.css("bl-quick-list-row-render"));
        expect(items.length).toBe(0);
    });

    it("show items when data is a set", async () => {
        testComponent.items = new Set([
            { id: "item-2", name: "Item 2" },
            { id: "item-3", name: "Item 3" },
            { id: "item-5", name: "Item 5" },
        ]);
        fixture.detectChanges();
        await fixture.whenStable();
        items = de.queryAll(By.css("bl-quick-list-row-render"));
        expect(items.length).toBe(3);
        expect(items[0].nativeElement.textContent).toContain("Item 2");
        expect(items[1].nativeElement.textContent).toContain("Item 3");
        expect(items[2].nativeElement.textContent).toContain("Item 5");
    });

    describe("when defining config for sorting", () => {
        beforeEach(() => {
            testComponent.config = {
                sorting: {
                    id: true,
                    name: true,
                },
            };
            fixture.detectChanges();
        });

        it("show context menu", async () => {
            rightClick(items[2]);
            fixture.detectChanges();

            expect(contextMenuServiceSpy.openMenu).toHaveBeenCalledOnce();
            const menu = contextMenuServiceSpy.lastMenu;

            expect(menu.items.length).toBe(1);
            const sortByMenu = menu.items[0] as MultiContextMenuItem;
            expect(sortByMenu instanceof MultiContextMenuItem).toBe(true);
            expect(sortByMenu.subitems.length).toBe(6);
            expect((sortByMenu.subitems[0] as ContextMenuItem).label).toEqual("Default");
            expect((sortByMenu.subitems[1] as ContextMenuItem).label).toEqual("Id");
            expect((sortByMenu.subitems[2] as ContextMenuItem).label).toEqual("Name");
            expect(sortByMenu.subitems[3] instanceof ContextMenuSeparator).toBe(true);
            expect((sortByMenu.subitems[4] as ContextMenuItem).label).toEqual("Ascending");
            expect((sortByMenu.subitems[4] as ContextMenuItem).checked).toBe(true);
            expect((sortByMenu.subitems[5] as ContextMenuItem).label).toEqual("Descending");
            expect((sortByMenu.subitems[5] as ContextMenuItem).checked).toBe(false);
        });

        it("sort", () => {
            rightClick(items[2]);
            const menu = contextMenuServiceSpy.lastMenu;
            const sortByMenu = menu.items[0] as MultiContextMenuItem;
            (sortByMenu.subitems[2] as ContextMenuItem).click();
            fixture.detectChanges();

            const rows = de.nativeElement.querySelectorAll("bl-quick-list-row-render");

            expect(rows[0].textContent).toEqual("AItem 2");
            expect(rows[1].textContent).toEqual("BItem 4");
            expect(rows[2].textContent).toEqual("Item 1");
            expect(rows[3].textContent).toEqual("Item 3");
            expect(rows[4].textContent).toEqual("Item 5");

        });

    });
    describe("When an item is active", () => {
        beforeEach(() => {
            quicklist.activeItem = "item-2";
            fixture.detectChanges();
        });

        it("Should have item initialy active", () => {
            expect(items[1].componentInstance.selected).toBe(true);
        });

        it("Shift click should select all items between current active and clicked", () => {
            sendEvent(items[3], ButtonClickEvents.leftShift);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");
            expect(selection.keys.size).toBe(3);
            expect(selection.keys.has("item-2")).toBe(true);
            expect(selection.keys.has("item-3")).toBe(true);
            expect(selection.keys.has("item-4")).toBe(true);
        });

        it("Ctrl click should select on item + the active item", () => {
            sendEvent(items[3], ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");

            expect(selection.keys.size).toBe(2);
            expect(selection.keys.has("item-2")).toBe(true, "has item-2");
            expect(selection.keys.has("item-4")).toBe(true, "has item-4");

            sendEvent(items[4], ButtonClickEvents.leftCtrl);
            expect(selection.keys.size).toBe(3);

            expect(selection.keys.has("item-2")).toBe(true, "has item-2");
            expect(selection.keys.has("item-4")).toBe(true, "has item-4");
            expect(selection.keys.has("item-5")).toBe(true, "has item-5");
        });

        it("Ctrl click on a selected item should unselect", () => {
            sendEvent(items[3], ButtonClickEvents.leftCtrl);
            sendEvent(items[4], ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(selection.keys.size).toBe(3);
            sendEvent(items[3], ButtonClickEvents.leftCtrl);
            expect(selection.keys.size).toBe(2);
            expect(selection.keys.has("item-2")).toBe(true);
            expect(selection.keys.has("item-5")).toBe(true);

            sendEvent(items[4], ButtonClickEvents.leftCtrl);

            expect(selection.keys.size).toBe(1, "Should not have unselected the active");
            expect(selection.keys.has("item-2")).toBe(true, "Should not have unselected the active");
        });
    });
});
