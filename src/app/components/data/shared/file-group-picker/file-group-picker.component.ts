import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material";
import { FilterBuilder, ListView } from "@batch-flask/core";
import { Activity, DialogService } from "@batch-flask/ui";
import { FileGroupCreateFormComponent } from "app/components/data/action";
import { BlobContainer } from "app/models";
import { NcjFileGroupService } from "app/services";
import { AutoStorageService, ListContainerParams, StorageContainerService } from "app/services/storage";
import { Constants } from "common";
import { List } from "immutable";
import { BehaviorSubject, Subject, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from "rxjs/operators";

import "./file-group-picker.scss";

@Component({
    selector: "bl-file-group-picker",
    templateUrl: "file-group-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileGroupPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileGroupPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileGroupPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public fileGroups: List<BlobContainer>;
    public value = new FormControl();
    public fileGroupsData: ListView<BlobContainer, ListContainerParams>;
    public warning = false;
    public fileGroupUploading: number | null;

    private _propagateChange: (value: any) => void = null;
    private _destroy = new Subject();
    private _loading: boolean = true;
    private _uploadActivity = new BehaviorSubject<Activity | null>(null);

    constructor(
        private fileGroupService: NcjFileGroupService,
        private autoStorageService: AutoStorageService,
        private storageContainerService: StorageContainerService,
        private changeDetector: ChangeDetectorRef,
        private dialogService: DialogService) {

        this.fileGroupsData = this.storageContainerService.listView();

        this.fileGroupsData.items.subscribe((fileGroups) => {
            this.fileGroups = fileGroups;
            this.changeDetector.markForCheck();
        });

        // listen to file group add events
        this.storageContainerService.onContainerAdded.pipe(
            takeUntil(this._destroy),
        ).subscribe((fileGroupId: string) => {
            this.autoStorageService.get().subscribe((storageAccountId) => {
                const container = storageContainerService.get(storageAccountId, fileGroupId);
                this.fileGroupsData.loadNewItem(container);
                container.subscribe((blobContainer) => {
                    this._checkValid(blobContainer.name);
                });
            });
        });

        this.value.valueChanges.pipe(
            takeUntil(this._destroy),
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value && this.fileGroupService.removeFileGroupPrefix(value));
            }
        });

        this._uploadActivity.pipe(
            takeUntil(this._destroy),
            switchMap((activity) => {
                if (!activity) { return of(null); }
                return activity.progress;
            }),
        ).subscribe((progress) => {
            this.fileGroupUploading = progress;
            this.changeDetector.markForCheck();
        });
        this._uploadActivity.pipe(
            takeUntil(this._destroy),
            switchMap((activity) => {
                if (!activity) { return of(null); }
                return activity.done;
            }),
        ).subscribe(() => {
            this.fileGroupUploading = null;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.autoStorageService.get().subscribe((storageAccountId) => {
            this.fileGroupsData.params = {
                storageAccountId,
            };

            this.fileGroupsData.setOptions({
                filter: FilterBuilder.prop("name").startswith(Constants.ncjFileGroupPrefix),
            });

            this.fileGroupsData.fetchAll().subscribe(() => {
                this._loading = false;
                this._checkValid(this.value.value);
            });
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this.fileGroupsData.dispose();
    }

    public writeValue(value: string) {
        this.value.setValue(value);
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

    public createFileGroup(event: MatOptionSelectionChange) {
        // isUserInput true when selected, false when not
        if (!event.source.value && event.isUserInput) {
            const dialog = this.dialogService.open(FileGroupCreateFormComponent);
            dialog.afterClosed().subscribe((activity?: Activity) => {
                const newFileGroupName = dialog.componentInstance.getCurrentValue().name;
                this.value.setValue(this.fileGroupService.addFileGroupPrefix(newFileGroupName));
                this.changeDetector.markForCheck();
                this._uploadActivity.next(activity);
            });
        }
    }

    public trackFileGroup(_: number, fileGroup: BlobContainer) {
        return fileGroup.id;
    }

    private _checkValid(value: string) {
        const valid = this._loading || !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
        this.changeDetector.markForCheck();
    }
}
