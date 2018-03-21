import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { UrlUtils } from "@batch-flask/utils";
import { List } from "immutable";
import * as moment from "moment";
import { Subscription } from "rxjs";

import { BlobContainer } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { ListView } from "app/services/core";
import "./blob-container-picker.scss";

export enum BlobContainerPickerOutput {
    Name = "name",
    SasUrl = "sasUrl",
}

@Component({
    selector: "bl-blob-container-picker",
    templateUrl: "blob-container-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BlobContainerPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => BlobContainerPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlobContainerPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    /**
     * What should be the output of the picker(Sas url, container name)
     */
    @Input() public output: BlobContainerPickerOutput = BlobContainerPickerOutput.SasUrl;

    /**
     * Permission for the sas url if having output as sas url
     */
    @Input() public sasPermissions: string = "rl";

    public containers: List<BlobContainer>;
    public container = new FormControl();
    public containersData: ListView<BlobContainer, ListContainerParams>;
    public warning = false;
    public loading: boolean = true;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];

    constructor(private storageService: StorageService, private changeDetector: ChangeDetectorRef) {

        this.containersData = this.storageService.containerListView();
        this.containersData.items.subscribe((containers) => {
            this.containers = containers;
            changeDetector.markForCheck();
        });

        this._subscriptions.push(this.container.valueChanges.debounceTime(400)
            .distinctUntilChanged().subscribe((value) => {
                this._checkValid(value);
                if (value
                    && this.output === BlobContainerPickerOutput.SasUrl
                    && !this._isSasUrl()
                    && this.containers.map(x => x.name).includes(value)
                    ) {
                    this._createSasUrl(value).subscribe((url) => {
                        this.container.setValue(url);
                    });
                } else {
                    if (this._propagateChange) {
                        this._propagateChange(value);
                    }
                }
            }));
    }

    public ngOnInit() {
        this.containersData.fetchAll().subscribe(() => {
            this.loading = false;
            this.changeDetector.markForCheck();
            this._checkValid(this.container.value);
        });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
        this.containersData.dispose();
    }

    public writeValue(value: string) {
        this.container.setValue(value);
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public trackContainer(index, container: BlobContainer) {
        return container.id;
    }

    private _checkValid(value: string) {
        const valid = this.loading || !value || this.containers.map(x => x.name).includes(value);
        this.warning = !valid;
    }

    private _isSasUrl() {
        return UrlUtils.isHttpUrl(this.container.value);
    }

    private _createSasUrl(container: string) {
        const accessPolicy = {
            AccessPolicy: {
                Permissions: this.sasPermissions,
                ResourceTypes: "CONTAINER",
                Services: "BLOB",
                Start: moment.utc().add(-15, "minutes").toDate(),
                Expiry: moment.utc().add(1, "day").toDate(),
            },
        };

        return this.storageService.generateSharedAccessContainerUrl(container, accessPolicy);
    }
}
