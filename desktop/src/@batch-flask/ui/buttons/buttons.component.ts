import { Component, Directive, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ButtonAction } from "./button.component";

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseButton {
    @Input() public action: ButtonAction;
    @Input() public disabled: boolean;
    @Input() public tooltipPosition: string = "below";
}

@Component({
    selector: "bl-loading-button",
    template: `
        <bl-button color="light" type="wide" [action]="action">
            <ng-content *ngIf="!loading"></ng-content>
            <i class="fa fa-spinner fa-spin" *ngIf="loading" aria-hidden="true"></i>
        </bl-button>
    `,
})
export class LoadingButtonComponent extends BaseButton {
    @Input()
    public loading: boolean = false;
}

@Component({
    selector: "bl-clear-list-selection",
    template: `
        <bl-button color="accent" [action]="onClick" matTooltip="Clear selection">
            <i class="fa fa-check-square-o" aria-hidden="true"></i>
        </bl-button>
    `,
})
export class ClearListSelectionButtonComponent extends BaseButton {
    @Input()
    public list: any;

    @autobind()
    public onClick() {
        this.action();
        this.list.clearSelection();
    }
}

@Component({
    selector: "bl-download-button",
    template: `
        <bl-button color="light" [action]="action" [disabled]="!enabled" title="Download" icon="fa fa-download"
            [tooltipPosition]="tooltipPosition">
        </bl-button>
    `,
})
export class DownloadButtonComponent extends BaseButton {
    @Input()
    public set enabled(value: boolean) {
        this._enabled = value;
    }
    public get enabled() {
        return this._enabled;
    }

    private _enabled: boolean = true;
}
