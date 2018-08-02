import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    forwardRef,
} from "@angular/core";
import {
    AsyncValidator,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    NG_ASYNC_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/ui";
import { FileOrDirectoryDto } from "app/models/dtos";
import { DragUtils } from "app/utils";
import { Subscription, from } from "rxjs";
import { map } from "rxjs/operators";

import "./file-or-directory-picker.scss";

@Component({
    selector: "bl-file-or-directory-picker",
    templateUrl: "file-or-directory-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileOrDirectoryPickerComponent), multi: true },
        { provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => FileOrDirectoryPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileOrDirectoryPickerComponent implements AsyncValidator, ControlValueAccessor, OnDestroy {
    @Input() public dragMessage: string = "Drag and drop files or folders here";

    public invalidPath: string;
    public isDraging = 0;
    public paths: FormControl<FileOrDirectoryDto[]>;

    private _propagateChange: (value: FileOrDirectoryDto[]) => void = null;
    private _sub: Subscription;

    constructor(
        private fs: FileSystemService,
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder) {

        this.paths = this.formBuilder.control([], null, this._validatePaths);
        this._sub = this.paths.valueChanges.subscribe((paths) => {
            if (this._propagateChange) {
                this._propagateChange(paths);
            }
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public writeValue(value: FileOrDirectoryDto[]) {
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
        return this._validatePaths(c);
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
        this.changeDetector.markForCheck();
    }

    @HostListener("dragleave", ["$event"])
    public dragLeave(event: DragEvent) {
        if (!this._canDrop(event.dataTransfer)) { return; }
        this.isDraging--;
        this.changeDetector.markForCheck();
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

    @autobind()
    private _validatePaths(control: FormControl) {
        return from(this._validatePathsAsync(control.value)).pipe(map((path) => {
            if (path) {
                return {
                    invalidFileOrPath: false,
                };
            }
            return null;
        }));
    }

    private async _validatePathsAsync(paths: Array<{ path: string }>) {
        for (const { path } of paths) {
            const exists = await this.fs.exists(path);
            if (!exists) {
                this.invalidPath = path;
                this.changeDetector.markForCheck();
                return path;
            }
        }
        this.invalidPath = null;
        this.changeDetector.markForCheck();
        return null;
    }
}
