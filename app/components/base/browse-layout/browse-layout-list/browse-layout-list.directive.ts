import { Directive, Host, Self } from "@angular/core";
import { ListBaseComponent } from "app/components/base/browse-layout/list-base";

@Directive({
    selector: "[blBrowseLayoutList]",
})
export class BrowseLayoutListDirective {
    constructor( @Host() @Self() private listComponent: ListBaseComponent) {
        console.log("List component", this.listComponent);
    }
}
