import { Component, HostListener, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import * as path from "path";
import { Subscription } from "rxjs";

import { ResourceFile } from "app/models";
import { DragUtils, UrlUtils } from "app/utils";

import "./resourcefile-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-resourcefile-picker",
    templateUrl: "resourcefile-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ResourcefilePickerComponent), multi: true },
    ],
})
export class ResourcefilePickerComponent implements ControlValueAccessor, OnDestroy {
    public files: FormControl;
    public isDraging = 0;

    private _propagateChange: (value: ResourceFile[]) => void = null;
    private _sub: Subscription;

    constructor(private formBuilder: FormBuilder) {
        this.files = this.formBuilder.control([]);
        this._sub = this.files.valueChanges.subscribe((files) => {
            if (this._propagateChange) {
                this._propagateChange(files);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: ResourceFile[]) {
        if (value) {
            this.files.setValue(value);
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
    public handleDropOnRow(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const dataTransfer = event.dataTransfer;
        const files = [...event.dataTransfer.files as any];
        if (this._hasLink(dataTransfer)) {
            const link = dataTransfer.getData("text/uri-list");
            if (UrlUtils.isHttpUrl(link)) {
                this._addResourceFileFromUrl(link);
            }
        } else if (this._hasFile(dataTransfer)) {
            console.log("Droped files", files);
        }
        this.isDraging = 0;
    }

    private _addResourceFileFromUrl(url: string) {
        const files = this.files.value.concat([{
            blobSource: url,
            filePath: path.basename(url),
        }]);
        this.files.setValue(files);
    }

    private _canDrop(dataTransfer: DataTransfer) {
        return this._hasFile(dataTransfer) || this._hasLink(dataTransfer);
    }

    private _hasFile(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("Files");
    }

    private _hasLink(dataTransfer: DataTransfer) {
        return dataTransfer.types.includes("text/uri-list");
    }
}
