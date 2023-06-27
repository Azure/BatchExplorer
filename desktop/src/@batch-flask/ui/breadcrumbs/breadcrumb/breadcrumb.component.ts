import { ChangeDetectionStrategy, Component, HostBinding, Injector, Input } from "@angular/core";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { BreadcrumbService } from "../breadcrumb.service";
import { Breadcrumb } from "../breadcrumbs.model";

@Component({
    selector: "bl-breadcrumb",
    templateUrl: "breadcrumb.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent extends ClickableComponent {
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

    @HostBinding("class.noselect") public readonly noselect = true;

    constructor(injector: Injector, private breadcrumbService: BreadcrumbService) {
        super(injector, null);
    }

    public handleAction(event) {
        super.handleAction(event);
        this.breadcrumbService.navigateTo(this.crumb);
    }
}
