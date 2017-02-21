import { Component, HostBinding, HostListener, Input } from "@angular/core";

import { Breadcrumb } from "./breadcrumb-models";
import { BreadcrumbService } from "./breadcrumb.service";

@Component({
    selector: "bl-breadcrumb",
    templateUrl: "breadcrumb.html",
})
export class BreadcrumbComponent {
    @Input()
    public crumb: Breadcrumb;

    @HostBinding("style.z-index")
    @Input()
    public index: number;

    @HostBinding("title")
    public get title() {
        return this.crumb && this.crumb.data.name;
    }

    @HostBinding("class")
    public classes = "noselect";

    constructor(private breadcrumbService: BreadcrumbService) {
    }

    @HostListener("click")
    public onClick() {
        this.breadcrumbService.navigateTo(this.crumb);
    }
}
