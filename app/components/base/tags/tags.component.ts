import { Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { log } from "app/utils";

@Component({
    selector: "bl-tags",
    templateUrl: "tags.html",
})
export class TagsComponent implements OnChanges {
    @Input()
    public tags: List<string>;

    @Input()
    public editable: boolean = false;

    @Input()
    public save: (tags: List<string>) => Observable<any>;

    @Input()
    public noTagsMessage = "";

    /**
     * Maximum number of tags to display without expanding
     */
    @Input()
    public maxTags = 10;

    public isEditing = false;
    public saving = false;

    public tagEditString = "";

    public displayTags: List<string> = List([]);

    public ngOnChanges(inputs) {
        if (inputs.tags || inputs.maxTags) {
            this.displayTags = List<string>(this.tags.slice(0, this.maxTags));
        }
    }

    public edit() {
        this._resetTagEditStr();
        this.isEditing = true;
    }

    public triggerSave() {
        const tags = this.tagEditString.split(",");
        this.isEditing = false;
        this.saving = true;
        this.save(List(tags)).subscribe({
            next: () => {
                this.saving = false;
            },
            error: (error) => {
                log.error("Error saving tags", error);
            },
        });
    }

    public cancel() {
        this._resetTagEditStr();
        this.isEditing = false;
    }

    private _resetTagEditStr() {
        this.tagEditString = this.tags.join(",");
    }
}
