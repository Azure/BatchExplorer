import { Component, OnInit, ViewChild, ViewContainerRef, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { MdCheckboxChange, MdDialog, MdDialogConfig } from "@angular/material";
import { List, Map } from "immutable";

import { TableComponent } from "app/components/base/table";
import { ApplicationLicense } from "app/models";
import { LicenseEulaDialogComponent } from "./";

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

    public licenses: List<ApplicationLicense> = List([]);

    private _propagateChange: (value: string[]) => void = null;
    private _propagateTouched: (value: boolean) => void = null;
    private _pickedLicenses: Map<string, boolean> = Map<string, boolean>({});
    private _eulaRead: boolean = false;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private dialog: MdDialog) {
    }

    public ngOnInit() {
        // TODO: read from service when it's available.
        this.licenses = List([
            new ApplicationLicense({
                id: "maya",
                description: "Autodesk Maya",
                licenseAgreement: "",
                cost: "50c USD",
            }),
            new ApplicationLicense({
                id: "arnold",
                description: "Autodesk Arnold",
                licenseAgreement: "",
                cost: "2c USD",
            }),
        ]);
    }

    public writeValue(value: any) {
        if (value) {
            this._pickedLicenses = value;
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    // need this in order for the bl-error validation control to work
    public registerOnTouched(fn) {
        this._propagateTouched = fn;
    }

    public pickLicense(id: string, event: MdCheckboxChange) {
        this._pickedLicenses[id] = event.checked;
        this._emitChangeAndTouchedEvents();
    }

    public validate(control: FormControl) {
        if (this._getPicked().length > 0 && !this._eulaRead) {
            return {
                required: true,
            };
        }

        return null;
    }

    public viewEula(name: string) {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;
        const dialogRef = this.dialog.open(LicenseEulaDialogComponent, config);
        dialogRef.componentInstance.licenseName = name;
    }

    public eulaCheck(event: MdCheckboxChange) {
        this._eulaRead = event.checked;
        this._fireChangeEvent();
    }

    private _getPicked(): string[] {
        return Object.keys(this._pickedLicenses).filter(x => this._pickedLicenses[x] === true);
    }

    private _emitChangeAndTouchedEvents() {
        this._fireChangeEvent();
        if (this._propagateTouched) {
            setTimeout(() => {
                this._propagateTouched(true);
            });
        }
    }

    private _fireChangeEvent() {
        if (this._propagateChange) {
            setTimeout(() => {
                this._propagateChange(this._getPicked());
            });
        }
    }
}
