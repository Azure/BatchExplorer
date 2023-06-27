import { Directive, Input, TemplateRef } from "@angular/core";

@Directive({
    selector: "[blVirtualRow]",
})
export class VirtualScrollRowDirective<T> {

    constructor(public templateRef: TemplateRef<any>) {}

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input("blVirtualRowTrackBy") public trackBy: (index: number, item: T) => any = (_, i) => i;
}
