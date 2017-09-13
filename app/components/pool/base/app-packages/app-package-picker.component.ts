import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { MdSelectChange } from "@angular/material";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { ApplicationPackage, BatchApplication, ServerError } from "app/models";
import { ApplicationService } from "app/services";
import { RxListProxy } from "app/services/core";

import "app/components/base/form/editable-table/editable-table.scss";

interface PackageReference {
    applicationId?: string;
    version?: string;
}

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-app-package-picker",
    templateUrl: "app-package-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
    ],
})
export class AppPackagePickerComponent implements ControlValueAccessor, Validator, AfterViewInit, OnDestroy, OnInit {
    @Output()
    public hasLinkedStorage: EventEmitter<boolean> = new EventEmitter();

    public status: Observable<LoadingStatus>;
    public applications: List<BatchApplication> = List([]);
    public packageMap: any[] = [];
    public items: FormArray;
    public form: FormGroup;

    private _subscriptions: Subscription[] = [];
    private _data: RxListProxy<{}, BatchApplication>;
    private _applicationMap: { [key: string]: string[] } = {};
    private _propagateChange: (items: any[]) => void;
    private _propagateTouched: (value: boolean) => void;
    private _writingValue = false;

    constructor(
        private applicationService: ApplicationService,
        private formBuilder: FormBuilder) {

        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });

        this._data = this.applicationService.list({}, (error: ServerError) => {
            if (this.applicationService.isAutoStorageError(error)) {
                this.hasLinkedStorage.emit(false);
                return true;
            }

            return false;
        });

        // subscribe to the application data proxy
        this._subscriptions.push(this._data.items.subscribe((applications) => {
            this._applicationMap = {};
            this._mapApplicationPackages(applications);
        }));

        // subscribe to the form change events
        this._subscriptions.push(this.items.valueChanges.subscribe((references: PackageReference[]) => {
            if (this._writingValue) {
                return;
            }

            const last = references[references.length - 1];
            if (last && last.applicationId && last.version) {
                this.addNewItem();
            }

            if (this._propagateChange) {
                this._propagateChange(this.items.value.slice(0, -1));
            }
        }));

        this.status = this._data.status;
    }

    public ngOnInit() {
        this._data.fetchNext();
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.addNewItem();
        });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    public writeValue(value: any[]) {
        // console.log("WRITE VALUE");
        this._writingValue = true;
        this.items.controls = [];

        if (value) {
            for (let val of value) {
                this.items.push(this.formBuilder.group(val));
                // TODO: this needs to add the package list
                this.packageMap.push();
            }
        } else {
            this.items.setValue([]);
        }

        this._writingValue = false;
        if (this.items.length > 0) {
            this.addNewItem();
        }
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn) {
        // need this in order for the bl-error validation control to work
        this._propagateTouched = fn;
    }

    public validate(control: FormControl) {
        if (!control.value) {
            return null;
        }

        console.log("validate ... GOT STUFF ", control.value);
        const tempMap: any = {};
        for (let reference of control.value) {
            const key = `${reference.applicationId}-${reference.version}`;
            if (!Boolean(key in tempMap)) {
                if (!this._isValidReference(reference.applicationId, reference.version)) {
                    return {
                        invalid: true,
                    };
                }

                tempMap[key] = key;
            } else {
                return {
                    duplicate: true,
                };
            }
        }

        return null;
    }

    public addNewItem() {
        this.items.push(this.formBuilder.group({
            applicationId: ["", []],
            version: ["", []],
        }));

        // console.log("addNewItem: ", this.items.controls);
        this.packageMap.push();
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
        this.packageMap.splice(index, 1);
    }

    public applicationSelected(event: MdSelectChange, index: number) {
        console.log("*** applicationSelected *** ", event);
        // each table row needs it's own package list
        this.packageMap[index] = List(this._applicationMap[event.value] || []);
        if (this._propagateTouched) {
            this._propagateTouched(true);
        }
    }

    private _isValidReference(application: string, version: string) {
        return application in this._applicationMap
            && this._applicationMap[application].indexOf(version) !== -1;
    }

    /*
     * Map application data into [application][packages[]]
     * _appPackageMap["blender"]["1", "1.34", "2"]
     * _appPackageMap["image-magic"]["1A", "1B"]
     * ...
     */
    private _mapApplicationPackages(applications: List<BatchApplication>) {
        this.applications = applications;
        if (applications && applications.size > 0) {
            applications.forEach((application) => {
                const currentAppId = application.id;
                if (this._applicationMap[currentAppId] === undefined) {
                    this._applicationMap[currentAppId] = [];
                }

                // If there is a default version set allow the user to select "use default"
                if (application.defaultVersion) {
                    this._applicationMap[currentAppId].push("Use default version");
                }

                // Add the packages to the application map
                application.packages.forEach((appPackage: ApplicationPackage) => {
                    const currentPackageVersion = appPackage.version;
                    if (this._applicationMap[currentAppId][currentPackageVersion] === undefined) {
                        this._applicationMap[currentAppId].push(currentPackageVersion);
                    }
                });
            });
        }
    }
}
