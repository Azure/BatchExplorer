import { Directive, Host, Self } from "@angular/core";
import { ListBaseComponent } from "app/core/list";

@Directive({
    selector: "[blBrowseLayoutList]",
})
export class BrowseLayoutListDirective {
    constructor( @Host() @Self() public component: ListBaseComponent) {
    }
}
