import { Directive, Host, Optional, Self } from "@angular/core";
import { ListBaseComponent } from "app/core/list";

@Directive({
    selector: "[blBrowseLayoutList]",
})
export class BrowseLayoutListDirective {
    constructor(@Host() @Self() @Optional() public component: ListBaseComponent) {
        if (!component) {
            throw new Error(`The component under this directive is not of type ListBaseComponent.`
                + `Make sure you extends ListBaseComponent`);
        }
    }
}
