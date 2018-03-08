import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";

/**
 * Combine a button and a file input control into one better looking control.
 */
@Component({
    selector: "bl-directory-picker",
    template: `
        <bl-button type="wide" (click)="launchBrowse()"><ng-content></ng-content></bl-button>
        <input #picker type="file" (change)="pickDirectory($event)" [hidden]="true" webkitdirectory />
    `,
})
export class DirectoryPickerComponent {
    @Output() public onChange = new EventEmitter<string>();

    @ViewChild("picker")
    private _picker: ElementRef;

    public launchBrowse() {
        if (this._picker) {
            this._picker.nativeElement.click();
        }
    }

    public pickDirectory(event: Event) {
        const element = event.srcElement as HTMLInputElement;

        const folders = element.files;
        let folder = null;
        if (folders.length !== 0) {
            folder = folders[0].path;
        }
        this.onChange.emit(folder);
    }
}
