import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";

@Component({
    selector: "bl-bool-property",
    templateUrl: "bool-property.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoolPropertyComponent {
    @Input() public label: string;

    @Input() @HostBinding("class.enabled") public value: boolean;

    @Input() public yesNo: boolean;

    public get text() {
        return this.yesNo
            ? (this.value ? "Yes" : "No")
            : (this.value ? "Enabled" : "Disabled");
    }
}
