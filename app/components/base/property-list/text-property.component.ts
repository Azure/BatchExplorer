import { Component, Input } from "@angular/core";
import { clipboard } from "electron";

@Component({
    selector: "bl-text-property",
    template: `
        <section class="one-line" (mouseenter)="showClipboard = true" (mouseleave)="showClipboard = false">
            <label>{{label}}</label>
            <span class="value" [title]="value">{{value}}</span>
            <span [hidden]="!showClipboard" class="clipboard" *ngIf="copyable">
                <i class="fa fa-clipboard" (click)="copyToClipBoard()"></i>
            </span>
        </section>
    `,
})
export class TextPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;

    @Input()
    public copyable: boolean = true;

    public showClipboard = false;

    public copyToClipBoard() {
        clipboard.writeText(this.value);
    }
}
