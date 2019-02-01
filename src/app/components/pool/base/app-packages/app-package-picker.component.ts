import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator,
} from "@angular/forms";
import { ListView, ServerError } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { BatchApplication, BatchApplicationPackage } from "app/models";
import { ApplicationListParams, BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

import "./app-package-picker.scss";

interface PackageReference {
    applicationId?: string;
    version?: string;
}

@Component({
    selector: "bl-app-package-picker",
    templateUrl: "app-package-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AppPackagePickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPackagePickerComponent implements ControlValueAccessor, Validator, OnDestroy {
    @Output() public hasLinkedStorage: EventEmitter<boolean> = new EventEmitter();

    public status: Observable<LoadingStatus>;
    public applications: List<BatchApplication> = List([]);
    public packageMap: StringMap<List<BatchApplicationPackage>> = {};
    public items: FormArray;
    public form: FormGroup;

    private _subscriptions: Subscription[] = [];
    private _data: ListView<BatchApplication, ApplicationListParams>;
    private _applicationMap: { [key: string]: string[] } = {};
    private _propagateChange: (items: any[]) => void;
    private _propagateTouched: () => void;
    private _writingValue = false;
    private _mapped = false;

    private _defaultVersionText = "Use default version";
    private _defaultVersionValue = "-1";

    constructor(
        private applicationService: BatchApplicationService,
        private packageService: BatchApplicationPackageService,
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder) {

        this.items = formBuilder.array([]);
        this.form = formBuilder.group({ items: this.items });
        this._mapped = false;

        this._data = this.applicationService.listView();

        this._data.onError = (error: ServerError) => {
            if (this.applicationService.isAutoStorageError(error)) {
                this.hasLinkedStorage.emit(false);
                return true;
            }

            return false;
        };

        // subscribe to the application data proxy
        this._data.items.subscribe((applications) => {
            this.applications = applications;

            this.changeDetector.markForCheck();
        });

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
                const cloned = this.items.value.slice(0, -1).map(item => {
                    const clone = JSON.parse(JSON.stringify(item));
                    if (clone.version === this._defaultVersionValue) {
                        clone.version = null;
                    }

                    return clone;
                });

                this._propagateChange(cloned);
            }
        }));

        this.status = this._data.status;
    }

    public ngOnDestroy() {
        this._data.dispose();
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    public writeValue(references: PackageReference[]) {
        this._writingValue = true;
        this.items.controls = [];
        if (references) {
            for (const reference of references) {
                this.addNewItem(reference.applicationId, reference.version || this._defaultVersionValue);
            }
        } else {
            this.items.setValue([]);
        }

        this._data.fetchNext();
        this._writingValue = false;
        this.addNewItem();
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn) {
        // need this in order for the bl-error validation control to work
        this._propagateTouched = fn;
    }

    public validate(control: FormControl) {
        if (!control.value || this._writingValue || !this._mapped) {
            return null;
        }

        const tempMap: any = {};
        for (const reference of control.value) {
            // TODO: remove lowerCase when API is fixed.
            const application = reference.applicationId && reference.applicationId.toLowerCase();
            const key = `${application}-${reference.version}`;
            if (!Boolean(key in tempMap)) {
                const version = !reference.version // this._defaultVersionValue
                    ? this._defaultVersionText
                    : reference.version.toLowerCase();

                if (!this._isValidReference(application, version)) {
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

    public addNewItem(applicationId = null, version = null) {
        this.items.push(this.formBuilder.group({
            applicationId: [applicationId, []],
            version: [version, []],
        }));
    }

    public deleteItem(index: number) {
        this.items.removeAt(index);
    }

    public applicationSelected(appName: string) {
        this.applicationService.getByName(appName).pipe(
            switchMap(x => this.packageService.listAll(x.id)),
        ).subscribe((packages) => {
            this.packageMap[appName] = packages;
            this.changeDetector.markForCheck();
        });
        this._propagateTouched();
    }

    public getPackageValue(version: string) {
        return version.toLowerCase() !== this._defaultVersionText.toLowerCase() ? version : this._defaultVersionValue;
    }

    public trackRow(index: number) {
        return index;
    }

    public trackApplication(_: number, application: BatchApplication) {
        return application.id;
    }

    public trackPackage(_: number, pkg: BatchApplicationPackage) {
        return pkg.id;
    }

    private _isValidReference(application: string, version: string) {
        return application in this._applicationMap
            && this._applicationMap[application].indexOf(version) !== -1;
    }
}
