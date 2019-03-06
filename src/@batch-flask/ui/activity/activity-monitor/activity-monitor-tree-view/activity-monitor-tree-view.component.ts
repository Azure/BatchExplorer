import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    EventEmitter, HostListener, Input, OnChanges, Output, QueryList, ViewChild, ViewChildren,
} from "@angular/core";
import { FocusSectionComponent } from "@batch-flask/ui/focus-section";
import { ChangeEvent } from "@batch-flask/ui/virtual-scroll";
import { Activity } from "../../activity-types";
import { ActivityMonitorItemComponent } from "../activity-monitor-item";

import "./activity-monitor-tree-view.scss";

interface TreeRow {
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
    @Input() public flashId: number;
    @Input() public name: string;
    @Input() public xButtonTitle: string;
    @Output() public focus = new EventEmitter<boolean>();
    @Output() public xButton = new EventEmitter<void>();

    public expanded = new Set<number>();
    public treeRows: TreeRow[] = [];
    public dropTargetPath: string = null;
    public isFocused = false;
    public focusedIndex: number = -1;
    public hoveredIndex: number;
    public focusedAction: number = null;
    public viewPortStart: number = 0;
    public flashIndex: number = -1;

    @ViewChildren(ActivityMonitorItemComponent) private _itemComponents: QueryList<ActivityMonitorItemComponent>;
    @ViewChild(FocusSectionComponent) private _focusSectionComponent: FocusSectionComponent;

    constructor(private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes) {
        if (changes.activities) {
            this._buildTreeRows();
        }
        if (changes.flashId) {
            const candidates = this.treeRows.filter(row => row.id === +changes.flashId.currentValue);
            if (candidates.length > 0) {
                // give some time for the focus section to render
                setTimeout(() => {
                    this._focusSectionComponent.focus();
                    this.flashIndex = candidates[0].index;
                    this.focusedIndex = candidates[0].index;
                }, 50);
            }
        }
    }

    public toggleRowExpand(treeRow: TreeRow) {
        if (treeRow.hasChildren) {
            this._toggleExpanded(treeRow);
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
            case "ArrowRight":
                this._onRightPress(curTreeRow, event.ctrlKey);
                event.preventDefault();
                break;
            case "ArrowLeft":
                this._onLeftPress(curTreeRow, event.ctrlKey);
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

    public collapseAll() {
        this.expanded.clear();
        this._buildTreeRows();
    }

    public xButtonClicked() {
        this.xButton.emit();
    }

    public treeRowTrackBy(treeRow: TreeRow) {
        return treeRow.id;
    }

    public onViewScroll(event: ChangeEvent) {
        this.viewPortStart = event.start;
    }

    /**
     * @param treeRow Tree row that should toggle the expansion
     * @returns boolean if the row is now expanded or not
     */
    private _toggleExpanded(treeRow: TreeRow): boolean {
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

    private _buildTreeRows() {
        this.treeRows = this._getTreeRowsForActivities(this.activities);
        this.changeDetector.markForCheck();
    }

    private _getTreeRowsForActivities(activities: Activity[], indent = 0): TreeRow[] {
        const tree = [];
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
                tree.push(row);
                if (expanded) {
                    for (const childRow of this._getTreeRowsForActivities(activity.subactivities, indent + 1)) {
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
    private _onRightPress(treeRow: TreeRow, ctrlKey: boolean) {
        // if the control key was pressed, expand the folder
        if (ctrlKey) {
            this.expand(treeRow);
        } else {
            // otherwise, navigate through the actions
            if (this.focusedAction === null) {
                this.focusedAction = 0;
            } else {
                this.focusedAction++;
            }
            this.changeDetector.markForCheck();
        }
    }

    private _onLeftPress(treeRow: TreeRow, ctrlKey: boolean) {
        // if the control key was pressed, collapse the folder
        if (ctrlKey) {
            this.collapse(treeRow);
        } else {
            // otherwise, navigate through the actionsz
            if (this.focusedAction === null) { return; }

            this.focusedAction--;
            if (this.focusedAction < 0) {
                this.focusedAction = null;
            }
            this.changeDetector.markForCheck();
        }
    }

    private _execItemAction(treeRow: TreeRow) {
        const arr = this._itemComponents.toArray();
        arr[treeRow.index].execAction();
    }
}
