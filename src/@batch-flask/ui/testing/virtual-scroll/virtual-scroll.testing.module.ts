import { CommonModule } from "@angular/common";
import { Component, ContentChild, EventEmitter, Input, NgModule, OnChanges, Output, forwardRef } from "@angular/core";
import { VirtualScrollComponent, VirtualScrollRowDirective } from "@batch-flask/ui/virtual-scroll";

@Component({
    selector: "bl-virtual-scroll",
    template: `
        <ng-template *ngFor="let item of items;trackBy: rowDef.trackBy"
            [ngTemplateOutlet]="rowDef.templateRef"
            [ngTemplateOutletContext]="{$implicit: item}"></ng-template>
    `,
    providers: [
        { provide: VirtualScrollComponent, useExisting: forwardRef(() => VirtualScrollMockComponent) },
    ],
})
export class VirtualScrollMockComponent implements OnChanges {
    @Input() public items: any[];
    @Input() public childHeight: number;
    @Output() public update = new EventEmitter();

    @ContentChild(VirtualScrollRowDirective, {static: false })
    public rowDef: VirtualScrollRowDirective<any>;

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
    imports: [CommonModule],
    declarations: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
        VirtualScrollRowDirective,
    ],
    exports: [
        VirtualScrollMockComponent,
        VirtualScrollTailMockComponent,
        VirtualScrollRowDirective,
    ],
})
export class VirtualScrollTestingModule {

}
