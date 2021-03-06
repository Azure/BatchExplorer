import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";

import "./virtual-scroll-tail.scss";

@Component({
    selector: "bl-virtual-scroll-tail",
    templateUrl: "virtual-scroll-tail.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualScrollTailComponent {
    @HostBinding("style.height.px")
    @Input() public height: number;
}
