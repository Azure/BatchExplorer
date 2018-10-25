import { Directive, Input, TemplateRef } from "@angular/core";

@Directive({
    selector: "[blVirtualRow]",
})
export class VirtualScrollRowDirective<T> {
    // tslint:disable-next-line:no-input-rename
    @Input("blVirtualRowTrackBy") public trackBy: (index: number, item: T) => any;

    constructor(public templateRef: TemplateRef<any>) {}
}
