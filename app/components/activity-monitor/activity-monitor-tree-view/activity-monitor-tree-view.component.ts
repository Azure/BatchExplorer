import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    EventEmitter, HostListener, Input, OnChanges, Output, QueryList, ViewChildren,
} from "@angular/core";
import { Activity } from "@batch-flask/ui";
import { ActivityMonitorItemComponent } from "../activity-monitor-item";

import "./activity-monitor-tree-view.scss";

export interface TreeRow {
    activity: Activity;
    id: number;
    expanded: boolean;
    hasChildren: boolean;
    indent: number;
    index: number;
    parent: TreeRow;
}

@Component({
    selector: "bl-activity-monitor-tree-view",
    templateUrl: "activity-monitor-tree-view.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorTreeViewComponent implements OnChanges {
    @Input() public activities: Activity[];
    @Input() public name: string;
    @Output() public focus = new EventEmitter<boolean>();

    public expanded = new Set<number>();
    public treeRows: TreeRow[] = [];
    public dropTargetPath: string = null;
    public isFocused = false;
    public focusedIndex: number;
    public hoveredIndex: number;
    public focusedAction: number = null;

    @ViewChildren(ActivityMonitorItemComponent) private _itemComponents: QueryList<ActivityMonitorItemComponent>;

    constructor(private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes) {
        if (changes.activities) {
            this._buildTreeRows();
        }
    }

    public toggleRowExpand(treeRow: TreeRow) {
        if (treeRow.hasChildren) {
            this.toggleExpanded(treeRow);
        }
        this.focusRow(treeRow);
    }

    public focusRow(treeRow: TreeRow) {
        this.focusedIndex = treeRow.index;
        this.focusedAction = null;
        this.changeDetector.markForCheck();
    }

    public hoverRow(treeRow: TreeRow) {
        this.hoveredIndex = treeRow.index;
        this.changeDetector.markForCheck();
    }

    public clearHover() {
        this.hoveredIndex = -1;
    }

    public isExpanded(id: number) {
        return this.expanded.has(id);
    }

    @HostListener("keydown", ["$event"])
    public handleKeyboardNavigation(event: KeyboardEvent) {
        event.stopImmediatePropagation();
        if (!this.isFocused) { return; }
        const curTreeRow = this.treeRows[this.focusedIndex];
        switch (event.code) {
            case "ArrowDown": // Move focus down
                this.focusedIndex++;
                this.focusedAction = null;
                event.preventDefault();
                break;
            case "ArrowUp":   // Move focus up
                this.focusedIndex--;
                this.focusedAction = null;
                event.preventDefault();
                break;
            case "ArrowRight": // Expand current row if applicable
                this._onRightPress(curTreeRow);
                event.preventDefault();
                break;
            case "ArrowLeft": // Expand current row if applicable
                this._onLeftPress(curTreeRow);
                event.preventDefault();
                break;
            case "Space":
            case "Enter":
                if (this.focusedAction === null) {
                    this.toggleRowExpand(curTreeRow);
                } else {
                    this._execItemAction(curTreeRow);
                }
                event.preventDefault();
                return;
            case "Tab":
                if (event.shiftKey) {
                    this._tabBackward(curTreeRow);
                } else {
                    this._tabForward(curTreeRow);
                }
                event.preventDefault();
                break;
            default:
                break;
        }
        this.focusedIndex = (this.focusedIndex + this.treeRows.length) % this.treeRows.length;
        this.changeDetector.markForCheck();
    }

    public setFocus(focus: boolean) {
        this.isFocused = focus;
        this.focus.emit(true);
        this.changeDetector.markForCheck();
    }

    public expand(treeRow: TreeRow) {
        if (!treeRow.hasChildren) { return; }
        this.expanded.add(treeRow.id);
        this._buildTreeRows();
    }

    public collapse(treeRow: TreeRow) {
        if (!treeRow.hasChildren) { return; }
        this.expanded.delete(treeRow.id);
        this._buildTreeRows();
    }

    /**
     * @param treeRow Tree row that should toggle the expansion
     * @returns boolean if the row is now expanded or not
     */
    public toggleExpanded(treeRow: TreeRow): boolean {
        const isExpanded = this.isExpanded(treeRow.id);
        if (isExpanded) {
            this.expanded.delete(treeRow.id);
        } else {
            this.expanded.add(treeRow.id);
            // this.fileNavigator.loadPath(treeRow.path);
        }
        this._buildTreeRows();
        this.changeDetector.markForCheck();
        return !isExpanded;
    }

    public collapseAll() {
        this.expanded.clear();
        this._buildTreeRows();
    }

    public treeRowTrackBy(treeRow: TreeRow) {
        return treeRow.id;
    }

    private _buildTreeRows() {
        this.treeRows = this._getTreeRowsForActivities(this.activities);
        this.changeDetector.markForCheck();
    }

    private _getTreeRowsForActivities(activities: Activity[], indent = 0, parent = null): TreeRow[] {
        const tree = [];
        for (const activity of activities) {
            const expanded = this.isExpanded(activity.id);
            const row = {
                activity,
                id: activity.id,
                expanded,
                indent,
                parent,
            };
            if (activity.subactivities.length > 0) {
                row["hasChildren"] = true;
                tree.push(row);
                if (expanded) {
                    for (const childRow of this._getTreeRowsForActivities(activity.subactivities, indent + 1, row)) {
                        tree.push(childRow);
                    }
                }
            } else {
                row["hasChildren"] = false;
                tree.push(row);
            }
        }
        for (const [index, row] of tree.entries()) {
            row.index = index;
        }
        return tree;
    }

    /* Key Navigation Helpers */
    private _onRightPress(treeRow: TreeRow) {
        if (this.isExpanded(treeRow.id)) {
            this.focusedIndex++;
        } else {
            this.expand(treeRow);
        }
    }

    private _onLeftPress(treeRow: TreeRow) {
        if (this.isExpanded(treeRow.id)) {
            this.collapse(treeRow);
        } else if (treeRow.parent) {
            this.focusedIndex = treeRow.parent.index;
        }
    }

    private _tabForward(treeRow: TreeRow) {
        if (this.focusedAction === null) {
            this.focusedAction = 0;
        } else {
            this.focusedAction++;
        }
        this.changeDetector.markForCheck();
    }

    private _tabBackward(treeRow: TreeRow) {
        if (this.focusedAction === null) { return; }

        this.focusedAction--;
        if (this.focusedAction < 0) {
            this.focusedAction = null;
        }
        this.changeDetector.markForCheck();
    }

    private _execItemAction(treeRow: TreeRow) {
        const arr = this._itemComponents.toArray();
        arr[treeRow.index].execAction();
    }
}
