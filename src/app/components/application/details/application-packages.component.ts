import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
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

    public deleteSelection() {
        this.commands.delete.executeFromSelection(this._selection);
    }

    public activateSelection() {
        this.commands.activate.executeFromSelection(this._selection);
    }

    private _activatedItemDeleteEnabled() {
        return this.application.properties.allowUpdates && this._selection.hasAny();
    }

    private _activatedItemActivateEnabled() {
        return !this._selection.hasMultiple();
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
