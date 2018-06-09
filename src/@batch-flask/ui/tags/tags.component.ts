import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, ViewChild } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { log } from "@batch-flask/utils";

import "./tags.scss";

@Component({
    selector: "bl-tags",
    templateUrl: "tags.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsComponent {
    @Input() public tags: List<string>;

    @Input() public editable: boolean = false;

    @Input() public save: (tags: List<string>) => Observable<any>;

    @Input() public noTagsMessage = "";

    /**
     * Maximum number of tags to display without expanding
     */
    @Input() public maxTags = 10;

    public isEditing = false;
    public saving = false;

    public tagEditString = "";

    @ViewChild("editInput")
    private _editInput: ElementRef;

    constructor(private changeDetector: ChangeDetectorRef) {
    }

    public edit() {
        this._resetTagEditStr();
        this.isEditing = true;
        this.changeDetector.markForCheck();
        setTimeout(() => {
            this._editInput.nativeElement.focus();
        });
    }

    public triggerSave() {
        const tags = List(this.tagEditString.split(","));
        this.isEditing = false;
        this.saving = true;
        this.changeDetector.markForCheck();

        this.save(tags).subscribe({
            next: () => {
                this.saving = false;
                this.changeDetector.markForCheck();
            },
            error: (error) => {
                log.error("Error saving tags", error);
            },
        });
    }

    public cancel() {
        this._resetTagEditStr();
        this.isEditing = false;
        this.changeDetector.markForCheck();
    }

    private _resetTagEditStr() {
        this.tagEditString = this.tags.join(",");
        this.changeDetector.markForCheck();
    }
}
