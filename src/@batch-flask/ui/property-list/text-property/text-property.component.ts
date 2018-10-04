import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ClipboardService } from "@batch-flask/ui/electron";
import { exists } from "@batch-flask/utils";

import "./text-property.scss";

@Component({
    selector: "bl-text-property",
    templateUrl: "text-property.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPropertyComponent {
    @Input() public label: string;

    @Input() public value: string;

    @Input() public copyable: boolean = true;
    /**
     * If the value should be wrapped when too long
     */
    @Input() public wrap: boolean = false;

    public clipboardDisplayed = false;

    constructor(private changeDetector: ChangeDetectorRef, private clipboard: ClipboardService) {}

    public showClipboard(value: boolean) {
        this.clipboardDisplayed = value;
        this.changeDetector.markForCheck();
    }

    public copyToClipBoard() {
        if (exists(this.value)) {
            this.clipboard.writeText(this.value.toString());
        }
    }
}
