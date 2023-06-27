import {
    ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output,
} from "@angular/core";
import { TreeRow } from "..";

import "./file-tree-view-row.scss";

@Component({
    selector: "bl-file-tree-view-row",
    templateUrl: "file-tree-view-row.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileTreeViewRowComponent {
    @Input() public treeRow: TreeRow;

    @Input() @HostBinding("class.active") public active: boolean;
    @Input() @HostBinding("class.drop-target") public dropHover: boolean;
    @Input() @HostBinding("class.focused") public focused: boolean;

    @Output() public toggleExpanded = new EventEmitter();

    @HostBinding("style.padding-left")
    public get paddingLeft() {
        return `${(this.treeRow.indent + 1) * 12}px`;
    }

    @HostBinding("class.virtual")
    public get virtual() {
        return this.treeRow.virtual;
    }

    // Aria
    @HostBinding("attr.role") public role = "treeitem";
    @HostBinding("attr.aria-expanded") public get ariaExpanded() {
        if (this.treeRow.isDirectory) {
            return this.treeRow.expanded;
        } else {
            return null;
        }
    }
    @HostBinding("attr.aria-level") public get ariaLevel() {
        return this.treeRow.indent + 1;
    }
    @HostBinding("attr.aria-selected") public get ariaSelected() {
        return this.active;
    }
    @HostBinding("attr.aria-label") public get ariaLabel() {
        return this.treeRow.name;
    }

    public get title() {
        if (this.treeRow.virtual) {
            return `${this.treeRow.path} (Virtual)`;
        } else {
            return this.treeRow.path;
        }
    }

    public handleCaretClick(event: MouseEvent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        this.toggleExpanded.emit();
    }
}
