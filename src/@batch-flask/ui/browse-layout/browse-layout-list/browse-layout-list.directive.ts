import { Directive, Host, Optional, Self, ViewContainerRef } from "@angular/core";
import { ListBaseComponent } from "@batch-flask/ui/abstract-list";
import { log } from "@batch-flask/utils";

@Directive({
    selector: "[blBrowseLayoutList]",
})
export class BrowseLayoutListDirective {
    constructor(@Host() @Self() @Optional() public component: ListBaseComponent, ref: ViewContainerRef) {
        if (!component) {
            log.error("Container ref: ", ref.element.nativeElement);
            throw new Error(`The component under this directive is not of type ListBaseComponent.`
                + `Make sure you extends ListBaseComponent and set the provider`
                + `providers: [{
                    provide: ListBaseComponent,
                    useExisting: forwardRef(() => MyComponent),
                }],`);
        }
    }
}
