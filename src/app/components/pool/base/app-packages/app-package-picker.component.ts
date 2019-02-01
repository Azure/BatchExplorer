import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { ListView, ServerError, autobind } from "@batch-flask/core";
import { BatchApplication } from "app/models";
import { ApplicationListParams, BatchApplicationPackageService, BatchApplicationService } from "app/services";
import { Subject, pipe } from "rxjs";
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap, takeUntil } from "rxjs/operators";

import { PipeableSelectOptions } from "@batch-flask/ui/form/editable-table";
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
export class AppPackagePickerComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
    // TODO-TIM check needed?
    @Output() public hasLinkedStorage: EventEmitter<boolean> = new EventEmitter();

    public references = new FormControl<PackageReference[]>([], this._duplicateValidator);
    public applicationNames: string[] = [];
    public _propagateChange: (references: PackageReference[]) => void;

    private _data: ListView<BatchApplication, ApplicationListParams>;
    private _destroy = new Subject();

    constructor(
        private applicationService: BatchApplicationService,
        private packageService: BatchApplicationPackageService,
        private changeDetector: ChangeDetectorRef) {

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
            this.applicationNames = applications.map(x => x.name).toArray();
            this.changeDetector.markForCheck();
        });

        this.references.valueChanges.pipe(takeUntil(this._destroy)).subscribe((references: PackageReference[]) => {
            console.log("refs", references);
            if (this._propagateChange) {
                this._propagateChange(references);
            }
        });
    }

    public ngOnInit() {
        this._data.fetchAll();
    }

    public ngOnDestroy() {
        this._data.dispose();
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(references: PackageReference[]) {
        this.references.setValue(references);
    }

    public registerOnChange(fn: (references: PackageReference[]) => void) {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: () => void) {
        // Nothing to do
    }

    public validate(c: FormControl): ValidationErrors | null {
        if (this.references.valid) {
            return null;
        } else {
            return this.references.errors;
        }
    }

    @autobind()
    public versionOptions(): PipeableSelectOptions {
        return pipe(
            map((values: { applicationId: string }) => values.applicationId),
            distinctUntilChanged(),
            filter(x => Boolean(x)),
            switchMap(applicationName => this.applicationService.getByName(applicationName)),
            switchMap(application => this.packageService.listAll(application.id)),
            map((packages) => packages.map(x => x.name).toArray()),
            publishReplay(1),
            refCount(),
        );
    }

    @autobind()
    private _duplicateValidator(control: FormControl<PackageReference[]>): ValidationErrors | null {
        const references = control.value;
        if (references === null) {
            return null;
        }
        let duplicate: string | null = null;
        const uniqueIds = new Set<string>();

        for (const reference of references) {
            const uid = `${reference.applicationId}/versions/${reference.version}`;
            if (uniqueIds.has(uid)) {
                duplicate = uid;
                return {
                    duplicate: {
                        value: duplicate,
                        message:
                            `Application ${reference.applicationId} has version ${reference.version} specified twice`,
                    },
                };
            }
            uniqueIds.add(uid);
        }

        return null;
    }
}
