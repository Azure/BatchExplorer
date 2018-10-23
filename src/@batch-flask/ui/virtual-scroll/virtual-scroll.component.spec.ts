import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { VirtualScrollTailComponent } from "@batch-flask/ui/virtual-scroll";
import { sendEvent } from "test/utils/helpers";
import { VirtualScrollComponent } from "./virtual-scroll.component";

// tslint:disable:trackBy-function

@Component({
    template: `
        <bl-virtual-scroll style="width: 400px;height: 500px"
            [childHeight]="100"
            [items]="items"
            (update)="viewPortItems = $event">

            <div class="item" *ngFor="let item of viewPortItems" style="width: 400px;height: 100px">{{item}}</div>

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

    public viewPortItems = [];

    public showTail = false;
}

describe("VirtualScrollComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: VirtualScrollComponent;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [VirtualScrollComponent, VirtualScrollTailComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-virtual-scroll"));
        component = de.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it("update the view port items", () => {
        expect(testComponent.viewPortItems.length).toBe(6);
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
        sendEvent(de, new MouseEvent("scroll")); // Need to emit now or this event is async
        fixture.detectChanges();
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

        it("scroll to given item", async (done) => {
            component.scrollToItemAt(4);
            fixture.detectChanges();
            expect(de.nativeElement.scrollTop).toBe(400);
            await fixture.whenStable();
            fixture.detectChanges();
            setTimeout(async () => {
                await fixture.whenStable();
                fixture.detectChanges();
                expect(de.nativeElement.scrollTop).toBe(400);
                const items = de.queryAll(By.css(".item"));
                expect(items.length).toBe(5);
                expect(items[0].nativeElement.textContent).toContain("item-05");
                expect(items[1].nativeElement.textContent).toContain("item-06");
                expect(items[2].nativeElement.textContent).toContain("item-07");
                expect(items[3].nativeElement.textContent).toContain("item-08");
                expect(items[4].nativeElement.textContent).toContain("item-09");
                done();
            });
        });
    });

});
