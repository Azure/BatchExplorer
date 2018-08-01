import { Component, OnInit, ViewChild, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { MatCheckboxChange, MatDialog, MatDialogConfig } from "@angular/material";
import { List } from "immutable";

import { TableComponent, TableConfig } from "@batch-flask/ui/table";
import { ApplicationLicense } from "app/models";
import { LicenseEulaDialogComponent } from "../license-eula-dialog";

import { ListSelection } from "@batch-flask/core/list";
import "./app-license-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-app-license-picker",
    templateUrl: "app-license-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppLicensePickerComponent), multi: true },
    ],
})
export class AppLicensePickerComponent implements ControlValueAccessor, OnInit, Validator {
    @ViewChild("licenseTable")
    public table: TableComponent;

    public tableConfig: TableConfig = {
        showCheckbox: true,
        activable: false,
    };

    public licenses: List<ApplicationLicense> = List([]);
    public pickedLicenses = new ListSelection();

    private _propagateChange: (value: string[]) => void = null;
    private _propagateTouched: (value: boolean) => void = null;
    private _eulaRead: boolean = false;

    constructor(
        private dialog: MatDialog) {
    }

    public ngOnInit() {
        // TODO: read from service when it's available.
        this.licenses = List([
            new ApplicationLicense({
                id: "maya",
                description: "Autodesk Maya",
                licenseAgreement: "",
                cost: "$0.18 USD/node/hour",
            }),
            new ApplicationLicense({
                id: "3dsmax",
                description: "Autodesk 3ds Max",
                licenseAgreement: "",
                cost: "$0.18 USD/node/hour",
            }),
            new ApplicationLicense({
                id: "arnold",
                description: "Autodesk Arnold",
                licenseAgreement: "",
                cost: "$0.025 USD/core/hour",
            }),
            new ApplicationLicense({
                id: "vray",
                description: "Chaos Group V-Ray",
                licenseAgreement: "",
                cost: "$0.025 USD/core/hour",
            }),
        ]);
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
}
