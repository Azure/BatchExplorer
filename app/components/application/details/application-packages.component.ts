import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";

import { ListSelection } from "app/core/list";
import { BatchApplication, PackageState } from "app/models";
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
        console.log("Mark for check???");
        this.activateEnabled = this._activatedItemActivateEnabled(key);
        this.deleteEnabled = this._activatedItemDeleteEnabled(key);
        this.editEnabled = this._activatedItemEditEnabled(key);
        this.changeDetector.markForCheck();
    }

    private _activatedItemEditEnabled(activeItemKey: string) {
        return this.application.allowUpdates && !this._isPackagePending(activeItemKey)
            && Boolean(activeItemKey);
    }

    private _activatedItemDeleteEnabled(activeItemKey: any) {
        return this.application.allowUpdates && Boolean(activeItemKey);
    }

    private _activatedItemActivateEnabled(activeItemKey: string) {
        return this._isPackagePending(activeItemKey);
    }

    private _isPackagePending(version: string): boolean {
        if (!version) { return false; }
        const pkg = this.application.packages.filter(x => x.version === version).first();
        return pkg && pkg.version === PackageState.pending;
    }

    private _resetEnabled() {
        this.deleteEnabled = false;
        this.editEnabled = false;
        this.activateEnabled = false;
    }
}
