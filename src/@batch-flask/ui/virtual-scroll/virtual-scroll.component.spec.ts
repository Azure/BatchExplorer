import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { VirtualScrollTailComponent } from "@batch-flask/ui/virtual-scroll";
import { sendEvent } from "test/utils/helpers";
import { VirtualScrollRowDirective } from "./virtual-scroll-row.directive";
import { VirtualScrollComponent } from "./virtual-scroll.component";

// tslint:disable:trackBy-function

@Component({
    template: `
        <bl-virtual-scroll style="width: 400px;height: 500px"
            [childHeight]="100"
            [items]="items">

            <div class="item"
                *blVirtualRow="let item; trackBy: trackItem"
                style="width: 400px;height: 100px">{{item}}</div>

            <bl-virtual-scroll-tail [height]="150" *ngIf="showTail">
                This is a tail
            </bl-virtual-scroll-tail>
        </bl-virtual-scroll>
    `,
})
class TestComponent {
    public items: string[] = [
        "item-01",
        "item-02",
        "item-03",
        "item-04",
        "item-05",
        "item-06",
        "item-07",
        "item-08",
        "item-09",
        "item-10",
        "item-11",
        "item-12",
    ];

    public showTail = false;

    public trackItem(_, item) {
        return item;
    }
}

describe("VirtualScrollComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: VirtualScrollComponent;
    let de: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [
                VirtualScrollComponent, VirtualScrollTailComponent, TestComponent, VirtualScrollRowDirective,
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-virtual-scroll"));
        component = de.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it("only shows a subset of the items", () => {
        const items = de.queryAll(By.css(".item"));
        expect(items.length).toBe(6);
        expect(items[0].nativeElement.textContent).toContain("item-01");
        expect(items[1].nativeElement.textContent).toContain("item-02");
        expect(items[2].nativeElement.textContent).toContain("item-03");
        expect(items[3].nativeElement.textContent).toContain("item-04");
        expect(items[4].nativeElement.textContent).toContain("item-05");
        expect(items[5].nativeElement.textContent).toContain("item-06");
    });

    it("when scrolling", async () => {
        de.nativeElement.scroll(0, 310);
        triggerScroll(de);
        await fixture.whenStable();
        fixture.detectChanges();
        const items = de.queryAll(By.css(".item"));
        expect(items.length).toBe(6);
        expect(items[0].nativeElement.textContent).toContain("item-04");
        expect(items[1].nativeElement.textContent).toContain("item-05");
        expect(items[2].nativeElement.textContent).toContain("item-06");
        expect(items[3].nativeElement.textContent).toContain("item-07");
        expect(items[4].nativeElement.textContent).toContain("item-08");
        expect(items[5].nativeElement.textContent).toContain("item-09");
    });

    describe("", () => {
        let requestAnimationFrameTmp;

        beforeEach(() => {
            // AnimationDriver
            requestAnimationFrameTmp = window.requestAnimationFrame;
            window.requestAnimationFrame = (callback) => setTimeout(() => callback(null)) as any;
        });

        afterEach(() => {
            window.requestAnimationFrame = requestAnimationFrameTmp;
        });

        it("ensure item is visible", async () => {
            component.ensureItemVisible("item-07", "instant");
            triggerScroll(de);
            expect(de.nativeElement.scrollTop).toBe(210);
            await fixture.whenStable();
            fixture.detectChanges();
            let items = de.queryAll(By.css(".item"));
            expect(items[0].nativeElement.textContent).toContain("item-03");
            expect(items[1].nativeElement.textContent).toContain("item-04");
            expect(items[2].nativeElement.textContent).toContain("item-05");
            expect(items[3].nativeElement.textContent).toContain("item-06");
            expect(items[4].nativeElement.textContent).toContain("item-07");

            component.ensureItemVisible("item-11", "instant");
            triggerScroll(de);
            expect(de.nativeElement.scrollTop).toBe(610);
            await fixture.whenStable();
            fixture.detectChanges();
            items = de.queryAll(By.css(".item"));
            expect(items[0].nativeElement.textContent).toContain("item-07");
            expect(items[1].nativeElement.textContent).toContain("item-08");
            expect(items[2].nativeElement.textContent).toContain("item-09");
            expect(items[3].nativeElement.textContent).toContain("item-10");
            expect(items[4].nativeElement.textContent).toContain("item-11");

            // Ensure item up in the list should scroll up
            component.ensureItemVisible("item-02", "instant");
            triggerScroll(de);
            expect(de.nativeElement.scrollTop).toBe(0);
            await fixture.whenStable();
            fixture.detectChanges();
            items = de.queryAll(By.css(".item"));
            expect(items[0].nativeElement.textContent).toContain("item-01");
            expect(items[1].nativeElement.textContent).toContain("item-02");
            expect(items[2].nativeElement.textContent).toContain("item-03");
            expect(items[3].nativeElement.textContent).toContain("item-04");
            expect(items[4].nativeElement.textContent).toContain("item-05");
        });

        it("scroll to given item", async () => {
            component.scrollToItemAt(4, "instant");
            triggerScroll(de);
            expect(de.nativeElement.scrollTop).toBe(400);
            await fixture.whenStable();
            fixture.detectChanges();
            const items = de.queryAll(By.css(".item"));
            expect(items[0].nativeElement.textContent).toContain("item-05");
            expect(items[1].nativeElement.textContent).toContain("item-06");
            expect(items[2].nativeElement.textContent).toContain("item-07");
            expect(items[3].nativeElement.textContent).toContain("item-08");
            expect(items[4].nativeElement.textContent).toContain("item-09");
        });
    });

});

function triggerScroll(el: DebugElement) {
    sendEvent(el, new Event("scroll"));
}
