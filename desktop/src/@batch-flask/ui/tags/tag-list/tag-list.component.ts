import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { List } from "immutable";

import "./tag-list.scss";

@Component({
    selector: "bl-tag-list",
    templateUrl: "tag-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent implements OnChanges {
    @Input() public tags: List<string>;
    @Input() public maxTags: number;
    @Input() public noTagsMessage: string;

    public displayTags: List<string> = List([]);

    public ngOnChanges(inputs) {
        if (inputs.tags || inputs.maxTags) {
            this.displayTags = List<string>(this.tags.slice(0, this.maxTags));
        }
    }

    public trackTag(index, tag: string) {
        return tag;
    }
}
