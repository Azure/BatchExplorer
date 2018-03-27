import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, ViewChild } from "@angular/core";

import "./option.scss";

@Component({
    selector: "bl-option",
    templateUrl: "option.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent {
    @Input() public value: string;

    @ViewChild(TemplateRef)
    public template: TemplateRef<any>;

    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
