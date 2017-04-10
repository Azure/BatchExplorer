import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { log } from "app/utils";
import { FormPageComponent } from "./form-page.component";

@Component({
    selector: "bl-form-picker",
    templateUrl: "form-picker.html",
})
export class FormPickerComponent {
    @Input()
    public name: string;

    @Input()
    public value: any;

    @Input()
    public page: FormPageComponent;

    @ViewChild("button")
    private _button: ElementRef;

    public onClick() {
        if (!this.page) {
            log.error("FormPicker: Page is input is not defined");
        }
        this.page.activate(this);
    }

    public focus() {
        this._button.nativeElement.focus();
    }
}
