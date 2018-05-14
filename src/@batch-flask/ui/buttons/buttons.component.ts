import { Component, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { ButtonAction } from "./button.component";

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
            <i class="fa fa-spinner fa-spin" *ngIf="loading"></i>
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
            <i class="fa fa-check-square-o"></i>
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

/**
 * Would be nice to be able to have an abstract base component that held the
 * button template and we just called super("Add", "fa-icon").
 */
@Component({
    selector: "bl-add-button",
    template: `
        <bl-button color="light" icon="fa fa-plus" [title]="title" [action]="action" permission="write">
        </bl-button>
    `,
})
export class AddButtonComponent extends BaseButton {
    @Input()
    public title: string = "Add";
}

@Component({
    selector: "bl-clone-button",
    template: `
        <bl-button color="light" [action]="action" [title]="title" icon="fa fa-clone" permission="write">
        </bl-button>
    `,
})
export class CloneButtonComponent extends BaseButton {
    @Input()
    public title: string = "Clone";
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

@Component({
    selector: "bl-resize-button",
    template: `
        <bl-button color="light" [action]="action" title="Resize" icon="fa fa-arrows-v" permission="write">
        </bl-button>
    `,
})
export class ResizeButtonComponent extends BaseButton {
}
