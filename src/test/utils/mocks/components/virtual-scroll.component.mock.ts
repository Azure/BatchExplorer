import { Component, EventEmitter, Input, OnChanges, Output, NgModule } from "@angular/core";

@Component({
    selector: "bl-virtual-scroll",
    template: "<ng-content></ng-content>",
})
export class VirtualScrollMockComponent implements OnChanges {
    @Input() public items: any[];
    @Input() public childHeight: number;
    @Output() public update = new EventEmitter();

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

export const virtualScrollMockComponents = [VirtualScrollMockComponent, VirtualScrollTailMockComponent];

@NgModule({
    declarations: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
    ],
    exports: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
    ]
})
export class VirtualScrollMockModule {

}
