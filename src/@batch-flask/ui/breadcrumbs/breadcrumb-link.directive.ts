import { Directive, HostListener, Input } from "@angular/core";
import { Router } from "@angular/router";

@Directive({
    selector: "[blBreadcrumbLink]",
})
export class BreadcrumbLinkDirective {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input("blBreadcrumbLink")
    public link: any[];

    constructor(private router: Router) {
    }

    @HostListener("click", ["$event.target"])
    public onClick(e) {
        this.router.navigate(this.link);
    }
}
