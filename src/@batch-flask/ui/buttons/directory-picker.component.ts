import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";

/**
 * Combine a button and a file input control into one better looking control.
 */
@Component({
    selector: "bl-directory-picker",
    templateUrl: "directory-picker.html",
})
export class DirectoryPickerComponent {
    @Input()
    public canPickFile: boolean = false;

    @Output()
    public onChange = new EventEmitter<string>();

    @ViewChild("picker")
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

        this.onChange.emit(targetPath);
    }
}
