import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";

import { ListSelection } from "@batch-flask/core/list";
import { BatchApplication } from "app/models";
import { ComponentUtils } from "app/utils";

@Component({
    selector: "bl-application-packages",
    templateUrl: "application-packages.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ApplicationPackagesComponent implements OnChanges {

    @Input() public application: BatchApplication;

    public deleteEnabled = false;
    public editEnabled = false;
    public activateEnabled = false;

    private _selection: ListSelection = new ListSelection();
    private _activeItem: string;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    public ngOnChanges(changes) {
        if (ComponentUtils.recordChangedId(changes.application)) {
            setTimeout(() => {
                this._resetEnabled();
            });
        }
    }

    public activeItemChanged(key: string) {
        this._activeItem = key;
        this._updateEnabled();
    }

    public selectionChanged(selection: ListSelection) {
        this._selection = selection;
        this._updateEnabled();
    }

    private _activatedItemEditEnabled() {
        return this.application.allowUpdates && !this._isPackagePending(this._activeItem)
            && Boolean(this._activeItem) && !this._selection.hasMultiple();
    }

    private _activatedItemDeleteEnabled() {
        return this.application.allowUpdates && Boolean(this._activeItem);
    }

    private _activatedItemActivateEnabled() {
        return this._isPackagePending(this._activeItem) && !this._selection.hasMultiple();
    }

    private _isPackagePending(version: string): boolean {
        if (!version) { return false; }
        // const pkg = this.application.packages.filter(x => x.version === version).first();
        // return pkg && pkg.state === PackageState.pending;
        return false;
    }

    private _updateEnabled() {
        this.activateEnabled = this._activatedItemActivateEnabled();
        this.deleteEnabled = this._activatedItemDeleteEnabled();
        this.editEnabled = this._activatedItemEditEnabled();
        this.changeDetector.markForCheck();
    }

    private _resetEnabled() {
        this.deleteEnabled = false;
        this.editEnabled = false;
        this.activateEnabled = false;
    }
}
