import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ButtonAction } from "./button.component";

/**
 * Combine a button and a file input control into one better looking control.
 */
@Component({
    selector: "bl-directory-picker",
    template: `
        <bl-button type="wide" (click)="launchBrowse()"><ng-content></ng-content></bl-button>
        <input #picker type="file" (change)="onChange($event)" [hidden]="true" webkitdirectory />
    `,
})
export class DirectoryPickerComponent {
    @Input()
    public onChange: ButtonAction;

    @ViewChild("picker")
    private _picker: ElementRef;

    public launchBrowse() {
        if (this._picker) {
            this._picker.nativeElement.click();
        }
    }
}
