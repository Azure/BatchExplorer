import { Component, HostBinding, HostListener, Input } from "@angular/core";

import { BreadcrumbService } from "../breadcrumb.service";
import { Breadcrumb } from "../breadcrumbs.model";

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

    public get icon() {
        return this.crumb && this.crumb.data.icon;
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
