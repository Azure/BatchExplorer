import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { BreadcrumbModule } from "app/components/base/breadcrumbs";
import { QuickListComponent, QuickListModule } from "app/components/base/quick-list";
import { ButtonClickEvents, click } from "test/utils/helpers";

interface TestItem {
    id: string;
    name: string;
}

@Component({
    template: `
        <bex-quick-list>
            <bex-quick-list-item *ngFor="let item of items" [key]="item.id">
                <h4 bex-quick-list-item-title>{{item.name}}</h4>
            </bex-quick-list-item>
        </bex-quick-list>
    `,
})
class TestComponent {
    public items: TestItem[] = [
        { id: "item-1", name: "Item 1" },
        { id: "item-2", name: "Item 2" },
        { id: "item-3", name: "Item 3" },
        { id: "item-4", name: "Item 4" },
        { id: "item-5", name: "Item 5" },
    ];
}

describe("QuickListComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let quicklist: QuickListComponent;
    let items: DebugElement[];

    let activeItemKey: string = null;
    let selectedItems: string[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [QuickListModule, RouterTestingModule.withRoutes([]), BreadcrumbModule],
            declarations: [TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bex-quick-list"));
        quicklist = de.componentInstance;
        quicklist.activatedItemChange.subscribe(e => activeItemKey = e.key);
        quicklist.selectedItemsChange.subscribe(x => selectedItems = x);
        fixture.detectChanges();
        items = de.queryAll(By.css("bex-quick-list-item"));
    });

    it("should display all the content", () => {
        expect(items.length).toBe(5);
        expect(items[0].nativeElement.textContent).toContain("Item 1");
        expect(items[1].nativeElement.textContent).toContain("Item 2");
        expect(items[2].nativeElement.textContent).toContain("Item 3");
        expect(items[3].nativeElement.textContent).toContain("Item 4");
        expect(items[4].nativeElement.textContent).toContain("Item 5");
    });

    it("click on an item should make the item active", () => {
        click(items[1].query(By.css(".quick-list-item")));
        fixture.detectChanges();
        const activeItem = quicklist.getActiveItemFromRouter();
        expect(activeItem).not.toBeNull();
        expect(activeItemKey).toEqual("item-2");
        expect(activeItem.active).toBe(true);
        expect(items[1].componentInstance.active).toBe(true);

        expect(selectedItems.length).toBe(1, "Should also select the item");
        expect(selectedItems[0]).toEqual("item-2", "Should also select the item");
    });

    describe("When an item is active", () => {
        beforeEach(() => {
            quicklist.setActiveItem("item-2");
            fixture.detectChanges();
        });

        it("Should have item initialy active", () => {
            expect(items[1].componentInstance.active).toBe(true);
        });

        it("Shift click should select all items between current active and clicked", () => {
            click(items[3].query(By.css(".quick-list-item")), ButtonClickEvents.leftShift);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");
            expect(selectedItems.length).toBe(3);
            expect(selectedItems[0]).toBe("item-2");
            expect(selectedItems[1]).toBe("item-3");
            expect(selectedItems[2]).toBe("item-4");
        });

        it("Ctrl click should select on item + the active item", () => {
            click(items[3].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(activeItemKey).toEqual("item-2", "Should not have changed active item");
            expect(selectedItems.length).toBe(2);
            expect(selectedItems[0]).toBe("item-2");
            expect(selectedItems[1]).toBe("item-4");

            click(items[4].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);
            expect(selectedItems.length).toBe(3);

            expect(selectedItems[0]).toBe("item-2");
            expect(selectedItems[1]).toBe("item-4");
            expect(selectedItems[2]).toBe("item-5");
        });

        it("Ctrl click on a selected item should unselect", () => {
            click(items[3].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);
            click(items[4].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);
            fixture.detectChanges();
            expect(selectedItems.length).toBe(3);
            click(items[3].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);
            expect(selectedItems.length).toBe(2);
            expect(selectedItems[0]).toBe("item-2");
            expect(selectedItems[1]).toBe("item-5");

            click(items[4].query(By.css(".quick-list-item")), ButtonClickEvents.leftCtrl);

            expect(selectedItems.length).toBe(1, "Should not have unselected the active");
            expect(selectedItems[0]).toEqual("item-2", "Should not have unselected the active");
        });
    });
});
