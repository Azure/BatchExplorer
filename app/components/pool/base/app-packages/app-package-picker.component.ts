import { AfterViewInit, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";
import { BatchApplication, ServerError } from "app/models";
import { ApplicationService } from "app/services";
import { RxListProxy } from "app/services/core";
import { ObjectUtils } from "app/utils";

import "app/components/base/form/editable-table/editable-table.scss";

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
    public status: Observable<LoadingStatus>;
    public applications: List<BatchApplication>;
    public noLinkedStorage: boolean = false;
    public items: FormArray;
    public form: FormGroup;

    private _subscriptions: Subscription[] = [];
    private _data: RxListProxy<{}, BatchApplication>;
    private _propagateChange: (items: any[]) => void;
    private _writingValue = false;

    constructor(
        private applicationService: ApplicationService,
        private formBuilder: FormBuilder) {

        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });

        this._data = this.applicationService.list({}, (error: ServerError) => {
            if (this.applicationService.isAutoStorageError(error)) {
                this.noLinkedStorage = true;
                return true;
            }

            return false;
        });

        // subscribe to the application data proxy
        this._subscriptions.push(this._data.items.subscribe((applications) => {
            this.applications = applications;
            // TODO :: Create app version map
        }));

        // subscribe to the form change events
        this._subscriptions.push(this.items.valueChanges.subscribe((references) => {
            if (this._writingValue) {
                return;
            }

            const isLast = references[references.length - 1];
            if (isLast && !this._isEmpty(isLast)) {
                this.addNewItem();
            }

            if (this._propagateChange) {
                this._propagateChange(this.items.value.slice(0, -1));
            }
        }));

        this.status = this._data.status;
    }

    public ngOnInit() {
        this.noLinkedStorage = false;
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
        // TODO: Test this works with clone pool data.
        console.log("writeValue: ", value);
        this._writingValue = true;
        this.items.controls = [];

        if (value) {
            for (let val of value) {
                this.items.push(this.formBuilder.group(val));
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

    public registerOnTouched() {
        // Do nothing
    }

    public validate(control: FormControl) {
        // TODO: Validate app package and versions for no duplicates and correct mappings
        return null;
    }

    public addNewItem() {
        // TODO: change this to TEntity based on the generic type of base class which is still to be implemented.
        // I can then reuse the majority of this file in a base class for other types of editable tables.
        const obj = { };
        obj["applicationId"] = "";
        obj["version"] = "";
        this.items.push(this.formBuilder.group(obj));
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
    }

    private _isEmpty(obj: any) {
        for (let value of ObjectUtils.values(obj)) {
            if (value) {
                return false;
            }
        }

        return true;
    }
}
