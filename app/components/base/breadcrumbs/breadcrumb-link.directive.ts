import { Directive, HostListener, Input } from "@angular/core";
import { Router } from "@angular/router";

@Directive({
    selector: "[bexBreadcrumbLink]",
})
export class BreadcrumbLinkDirective {
    // tslint:disable-next-line:no-input-rename
    @Input("bexBreadcrumbLink")
    public link: any[];

    constructor(private router: Router) {

    }

    @HostListener("click", ["$event.target"])
    public onClick(e) {
        console.log("Clicked", e);
        this.router.navigate(this.link);
    }
}
