import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "bl-link-property",
    templateUrl: "link-property.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPropertyComponent {
    @Input() public label: string;

    @Input() public value: string;

    @Input() public link: string;
}
