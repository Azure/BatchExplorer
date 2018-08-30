import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { Activity } from "@batch-flask/ui";

import "./activity-monitor-tree-view.scss";

export interface TreeRow {
    activity: Activity;
    id: number;
    expanded: boolean;
    hasChildren: boolean;
    indent: number;
    index: number;
}

@Component({
    selector: "bl-activity-monitor-tree-view",
    templateUrl: "activity-monitor-tree-view.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityMonitorTreeViewComponent implements OnChanges {
    @Input() public activities: Activity[];
    @Input() public name: string;

    public expanded = new Set<number>();
    public treeRows: TreeRow[] = [];
    public dropTargetPath: string = null;
    public isFocused = false;
    public focusedIndices: Set<number> = new Set([0]);

    constructor(private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes) {
        if (changes.activities) {
            this._buildTreeRows();
        }
    }

    public activateRow(treeRow: TreeRow) {
        if (treeRow.hasChildren && !treeRow.expanded) {
            this.toggleExpanded(treeRow);
        }
        this.focusedIndices = new Set([treeRow.index]);
        this.changeDetector.markForCheck();
    }

    public focusRow(treeRow: TreeRow) {
        const isExpanded = this.isExpanded(treeRow.id);

        if (isExpanded) {
            const nextIndex = this.activities.map(act => act.id).indexOf(treeRow.id) + 1;
            const nextId = this.activities[nextIndex] ? this.activities[nextIndex].id : -1;
            const focusedIndices = new Set<number>();
            for (let i = treeRow.index; i < this.treeRows.length && this.treeRows[i].id !== nextId; i++) {
                focusedIndices.add(i);
            }
            this.focusedIndices = focusedIndices;
        } else {
            this.focusedIndices = new Set([treeRow.index]);
        }
    }

    public hoverRow(treeRow: TreeRow) {

    }

    public shouldFocus(index: number) {
        return this.focusedIndices.has(index);
    }

    public isExpanded(id: number) {
        return this.expanded.has(id);
    }

    public handleKeyboardNavigation(event) {
        const curTreeRow = this.treeRows[this.focusedIndices[0]];
        switch (event.code) {
            case "ArrowDown": // Move focus down
                // this.focusedIndex++;
                event.preventDefault();
                break;
            case "ArrowUp":   // Move focus up
                // this.focusedIndex--;
                event.preventDefault();
                break;
            case "ArrowRight": // Expand current row if applicable
                this.expand(curTreeRow);
                event.preventDefault();
                break;
            case "ArrowLeft": // Expand current row if applicable
                this.collapse(curTreeRow);
                event.preventDefault();
                break;
            case "Space":
            case "Enter":
                this.activateRow(curTreeRow);
                event.preventDefault();
                return;
            default:
        }
        // this.focusedIndex = (this.focusedIndex + this.treeRows.length) % this.treeRows.length;
        this.changeDetector.markForCheck();
    }

    public setFocus(focus: boolean) {
        this.isFocused = focus;
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

    private _getTreeRowsForActivities(activities: Activity[], indent = 0): TreeRow[] {
        const rows = [];
        for (const activity of activities) {
            const expanded = this.isExpanded(activity.id);
            const row = {
                activity,
                id: activity.id,
                expanded,
                indent,
            };
            if (activity.subactivities.length > 0) {
                row["hasChildren"] = true;
                rows.push(row);
                if (expanded) {
                    for (const row of this._getTreeRowsForActivities(activity.subactivities, indent + 1)) {
                        rows.push(row);
                    }
                }
            } else {
                row["hasChildren"] = false;
                rows.push(row);
            }
        }
        for (const [index, row] of rows.entries()) {
            row.index = index;
        }
        console.log(rows);
        return rows;
    }
}
