import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { ListSelection } from "@batch-flask/core/list";
import { BatchApplication } from "app/models";
import { ComponentUtils } from "app/utils";
import { BatchApplicationPackageCommands } from "../action";

@Component({
    selector: "bl-application-packages",
    templateUrl: "application-packages.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [BatchApplicationPackageCommands]
})
export class ApplicationPackagesComponent implements OnChanges {

    @Input() public application: BatchApplication;

    public deleteEnabled = false;
    public activateEnabled = false;

    private _selection: ListSelection = new ListSelection();
    private _activeItem: string;

    constructor(public commands: BatchApplicationPackageCommands, private changeDetector: ChangeDetectorRef) {

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

    public deleteSelection() {
        this.commands.delete.executeMultipleByIds([...this._selection.keys]);
    }

    public activateSelection() {
        this.commands.activate.executeMultipleByIds([...this._selection.keys]);
    }

    private _activatedItemDeleteEnabled() {
        return this.application.properties.allowUpdates && Boolean(this._activeItem);
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
        this.changeDetector.markForCheck();
    }

    private _resetEnabled() {
        this.deleteEnabled = false;
        this.activateEnabled = false;
    }
}
