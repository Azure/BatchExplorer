import { Component, HostListener, Input, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ResourceFileAttributes } from "app/models";
import { DragUtils } from "app/utils";

import "./file-or-directory-picker.scss";

export interface FileOrDirectory {
    path: string;
}

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-file-or-directory-picker",
    templateUrl: "file-or-directory-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileOrDirectoryPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileOrDirectoryPickerComponent), multi: true },
    ],
})
export class FileOrDirectoryPickerComponent implements ControlValueAccessor, OnDestroy {
    @Input()
    public dragMessage: string = "Drag and drop files or folders here";

    public isDraging = 0;
    public paths: FormControl<FileOrDirectory[]>;

    private _propagateChange: (value: FileOrDirectory[]) => void = null;
    private _sub: Subscription;

    constructor(
        private formBuilder: FormBuilder) {

        this.paths = this.formBuilder.control([]);
        this._sub = this.paths.valueChanges.subscribe((paths) => {
            if (this._propagateChange) {
                this._propagateChange(paths);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ResourceFileAttributes[]) {
        if (value) {
            this.paths.setValue(value);
        }
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

    @HostListener("dragover", ["$event"])
    public handleDragHover(event: DragEvent) {
        const allowDrop = this._canDrop(event.dataTransfer);
        DragUtils.allowDrop(event, allowDrop);
    }

    @HostListener("dragenter", ["$event"])
    public dragEnter(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        event.stopPropagation();
        this.isDraging++;
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        this.isDraging--;
    }

    @HostListener("drop", ["$event"])
    public handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        const filesAndFolders = [...event.dataTransfer.files as any];
        filesAndFolders.map(x => this._addPath(x.path));
        this.isDraging = 0;
    }

    private _addPath(path: string) {
        const filesAndFolders = this.paths.value.concat([{ path: path }]);
        this.paths.setValue(filesAndFolders);
    }

    private _canDrop(dataTransfer: DataTransfer) {
        return this._hasFile(dataTransfer);
    }

    private _hasFile(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("Files");
    }
}
