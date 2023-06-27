import { ChangeDetectionStrategy, Component, HostListener, Input } from "@angular/core";
import { ENTER, SPACE } from "@batch-flask/core/keys";

@Component({
    selector: "bl-link-property",
    templateUrl: "link-property.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPropertyComponent {
    @Input() public label: string;

    @Input() public value: string;

    @Input() public link: string;

    @HostListener("keyup", ["$event"])
    keyPressed($event: KeyboardEvent) {
        $event.stopImmediatePropagation();
        if ($event.code === ENTER || $event.code === SPACE) {
            ($event.target as HTMLElement).click();
        }
    }
}
