import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { BatchApplication } from "app/models";
import { ComponentUtils } from "app/utils";
import { BatchApplicationPackageCommands } from "../action";

@Component({
    selector: "bl-application-packages",
    templateUrl: "application-packages.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [BatchApplicationPackageCommands],
})
export class ApplicationPackagesComponent implements OnChanges {

    @Input() public application: BatchApplication;

    public deleteEnabled = false;
    public activateEnabled = false;

    private _selection: ListSelection = new ListSelection();

    constructor(public commands: BatchApplicationPackageCommands, private changeDetector: ChangeDetectorRef) {

    }

    public ngOnChanges(changes) {
        if (ComponentUtils.recordChangedId(changes.application)) {
            this._resetEnabled();
        }
    }

    public selectionChanged(selection: ListSelection) {
        this._selection = selection;
        this._updateEnabled();
    }

    @autobind()
    public deleteSelection() {
        return this.commands.delete.executeFromSelection(this._selection);
    }

    @autobind()
    public activateSelection() {
        return this.commands.activate.executeFromSelection(this._selection);
    }

    private _isDeleteButtonEnabled() {
        return this.application.properties.allowUpdates && this._selection.hasAny();
    }

    private _checkActivateButtonEnabled() {
        if (this._selection.isEmpty() || this._selection.hasMultiple()) {
            this.activateEnabled = false;
        } else {
            const packageId = this._selection.first();
            this.commands.getFromCache(packageId).subscribe((pkg) => {
                this.activateEnabled = this.commands.activate.enabled(pkg);
                this.changeDetector.markForCheck();
            });
        }
    }

    private _updateEnabled() {
        this.deleteEnabled = this._isDeleteButtonEnabled();
        this._checkActivateButtonEnabled();
        this.changeDetector.markForCheck();
    }

    private _resetEnabled() {
        this.deleteEnabled = false;
        this.activateEnabled = false;
        this.changeDetector.markForCheck();
    }
}
