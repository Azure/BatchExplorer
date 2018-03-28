import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import "./option.scss";

@Component({
    selector: "bl-option",
    templateUrl: "option.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent {
    @Input() public value: string;

    /**
     * What is searchable
     */
    @Input() public label: string;

    @Input() public disabled: boolean;
}
