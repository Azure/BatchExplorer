import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import "./tag-list.scss";

@Component({
    selector: "bl-tag-list",
    templateUrl: "tag-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent {
    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
