import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ListSelection } from "@batch-flask/core/list";
import { ElectronShell } from "@batch-flask/electron";
import { TableConfig } from "@batch-flask/ui/table";
import { ApplicationLicense } from "app/models";
import { PricingService } from "app/services";
import { SoftwarePricing } from "app/services/pricing";
import { List } from "immutable";
import { LicenseEulaDialogComponent } from "../license-eula-dialog";

import "./app-license-picker.scss";

const softwares = [
    {
        id: "maya",
        description: "Autodesk Maya",
    },
    {
        id: "3dsmax",
        description: "Autodesk 3ds Max",
    },
    {
        id: "arnold",
        description: "Autodesk Arnold",
    },
    {
        id: "vray",
        description: "Chaos Group V-Ray & V-Ray RT",
    },
];

@Component({
    selector: "bl-app-license-picker",
    templateUrl: "app-license-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLicensePickerComponent implements ControlValueAccessor, OnInit, Validator {
    public tableConfig: TableConfig = {
        showCheckbox: true,
        activable: false,
    };

    public licenses: List<ApplicationLicense> = List([]);
    public pickedLicenses = new ListSelection();

    private _propagateChange: (value: string[]) => void = null;
    private _propagateTouched: (value: boolean) => void = null;
    private _eulaRead: boolean = false;
    private _pricing: SoftwarePricing;

    constructor(
        private pricingService: PricingService,
        private changeDetector: ChangeDetectorRef,
        private dialog: MatDialog,
        private electronShell: ElectronShell) {
    }

    public ngOnInit() {
        this.pricingService.getSoftwarePricing().subscribe((pricing) => {
            this._pricing = pricing;
        });
        // TODO: read from service when it's available.
        this._updateLicenses();
    }

    public writeValue(value: any) {
        if (value) {
            this.pickedLicenses = new ListSelection({ keys: value });
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    // need this in order for the bl-error validation control to work
    public registerOnTouched(fn) {
        this._propagateTouched = fn;
    }

    public updateSelection(selection: ListSelection) {
        if (this.pickedLicenses === selection) { return; }
        this.pickedLicenses = selection;
        this.changeDetector.markForCheck();
        this._emitChangeAndTouchedEvents();
    }

    public validate(control: FormControl) {
        if (this.pickedLicenses.hasAny() && !this._eulaRead) {
            return {
                required: true,
            };
        }

        return null;
    }

    public viewEula(license: ApplicationLicense) {
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(LicenseEulaDialogComponent, config);
        dialogRef.componentInstance.license = license;
    }

    public eulaCheck(event: MatCheckboxChange) {
        this._eulaRead = event.checked;
        this._fireChangeEvent();
    }

    public trackByFn(index, license) {
        return license.id;
    }

    private _emitChangeAndTouchedEvents() {
        this._fireChangeEvent();
        if (this._propagateTouched) {
            this._propagateTouched(true);
        }
    }

    private _fireChangeEvent() {
        if (this._propagateChange) {
            this._propagateChange([...this.pickedLicenses.keys]);
        }
    }

    private _updateLicenses() {
        this.licenses = List(softwares.map((software) => {
            const cost = this._pricing && this._pricing.get(software.id);
            let costStr = "-";

            if (cost && cost.name === "vray") {
                const vrayrtCost = this._pricing && this._pricing.get("vrayrt");
                costStr = `$${cost.price}/${cost.billingUnit as string}/hour & ` +
                          `$${vrayrtCost.price}/${vrayrtCost.billingUnit as string}/hour`;
            } else if (cost) {
                costStr = `$${cost.price}/${cost.billingUnit as string}/hour`;
            }

            return new ApplicationLicense({
                ...software,
                cost: costStr,
            });
        }));
        this.changeDetector.markForCheck();
    }

    public openLink(link: string) {
        this.electronShell.openExternal(link, {activate: true});
    }
}
