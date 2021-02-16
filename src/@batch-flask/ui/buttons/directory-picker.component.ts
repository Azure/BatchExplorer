import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

/**
 * Combine a button and a file input control into one better looking control.
 */
@Component({
    selector: "bl-directory-picker",
    templateUrl: "directory-picker.html",
})
export class DirectoryPickerComponent {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input("attr.aria-describedby") public ariaDescribedBy: string;

    @Input() public canPickFile: boolean = false;

    @Output()
    public onChange = new EventEmitter<string>();

    @Output()
    public eventChange = new EventEmitter<Event>();

    @ViewChild("picker", { static: false })
    private _picker: ElementRef;

    public launchBrowse() {
        if (this._picker) {
            this._picker.nativeElement.click();
        }
    }

    public pickTarget(event: Event) {
        const element = event.srcElement as HTMLInputElement;
        const files = element.files;
        let targetPath = null;
        if (files.length !== 0) {
            targetPath = files[0].path;
        }

        if (this.canPickFile) {
            this.eventChange.emit(event);
        }
        this.onChange.emit(targetPath);
    }
}
