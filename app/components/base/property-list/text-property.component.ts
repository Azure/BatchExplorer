import { Component, Input } from "@angular/core";
import { clipboard } from "electron";

@Component({
    selector: "bl-text-property",
    template: `
        <bl-property-field [class.one-line]="!wrap" (mouseenter)="showClipboard = true" (mouseleave)="showClipboard = false">
            <div propertyLabel>{{label}}</div>
            <div propertyContent [class.wrap]="wrap" [title]="value">
                {{value}}
            </div>
            <div propertyClipboard [hidden]="!showClipboard" class="clipboard" *ngIf="copyable">
                    <i class="fa fa-clipboard" (click)="copyToClipBoard()"></i>
            </div>
        </bl-property-field>
    `,
})
export class TextPropertyComponent {
    @Input() public label: string;

    @Input() public value: string;

    @Input() public copyable: boolean = true;
    /**
     * If the value should be wrapped when too long
     */
    @Input() public wrap: boolean = false;

    public showClipboard = false;

    public copyToClipBoard() {
        clipboard.writeText(this.value);
    }
}
