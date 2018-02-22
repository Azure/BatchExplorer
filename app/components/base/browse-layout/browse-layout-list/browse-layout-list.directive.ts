import { Directive, Host, Optional, Self, ViewContainerRef } from "@angular/core";

import { ListBaseComponent } from "app/core/list";
import { log } from "app/utils";

@Directive({
    selector: "[blBrowseLayoutList]",
})
export class BrowseLayoutListDirective {
    constructor(@Host() @Self() @Optional() public component: ListBaseComponent, ref: ViewContainerRef) {
        if (!component) {
            log.error("Container ref: ", ref.element.nativeElement);
            throw new Error(`The component under this directive is not of type ListBaseComponent.`
                + `Make sure you extends ListBaseComponent and set the provider`
                + `providers: [listBaseProvider(() => MyComponent)],`);
        }
    }
}
