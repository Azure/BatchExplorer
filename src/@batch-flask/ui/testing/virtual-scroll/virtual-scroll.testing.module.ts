import { Component, EventEmitter, Input, NgModule, OnChanges, Output, forwardRef } from "@angular/core";
import { VirtualScrollComponent } from "@batch-flask/ui/virtual-scroll";

@Component({
    selector: "bl-virtual-scroll",
    template: "<ng-content></ng-content>",
    providers: [
        { provide: VirtualScrollComponent, useExisting: forwardRef(() => VirtualScrollMockComponent) },
    ],
})
export class VirtualScrollMockComponent implements OnChanges {
    @Input() public items: any[];
    @Input() public childHeight: number;
    @Output() public update = new EventEmitter();

    public ensureItemVisible = jasmine.createSpy("ensureItemVisible");

    public ngOnChanges(changes) {
        if (changes.items) {
            this.update.emit(this.items);
        }
    }
}

@Component({
    selector: "bl-virtual-scroll-tail",
    template: "<ng-content></ng-content>",
})
export class VirtualScrollTailMockComponent {
    @Input() public height: number;
}

@NgModule({
    declarations: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
    ],
    exports: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
    ],
})
export class VirtualScrollTestingModule {

}
