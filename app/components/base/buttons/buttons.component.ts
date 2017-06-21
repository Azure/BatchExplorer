import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Job, JobState } from "app/models";

export class BaseButton {
    @Output()
    public action = new EventEmitter();
}

@Component({
    selector: "bl-loading-button",
    template: `
        <bl-action-btn color="primary" type="wide" (action)="action.emit()">
            <ng-content *ngIf="!loading"></ng-content>
            <i class="fa fa-spinner fa-spin" *ngIf="loading"></i>
        </bl-action-btn>
    `,
})
export class LoadingButtonComponent extends BaseButton {
    @Input()
    public loading: boolean = false;
}

@Component({
    selector: "bl-clear-list-selection",
    template: `
        <bl-action-btn color="accent" (action)="onClick()" md-tooltip="Clear selection">
            <i class="fa fa-check-square-o"></i>
        </bl-action-btn>
    `,
})
export class ClearListSelectionButtonComponent extends BaseButton {
    @Input()
    public list: any;

    public onClick() {
        this.action.emit();
        this.list.clearSelection();
    }
}

/**
 * Would be nice to be able to have an abstract base component that held the
 * button template and we just called super("Add", "fa-icon").
 */
@Component({
    selector: "bl-add-button",
    template: `<bl-action-btn icon="fa fa-plus" [title]="title" (action)="action.emit()"></bl-action-btn>`,
})
export class AddButtonComponent extends BaseButton {
    @Input()
    public set title(value: string) {
        this._title = value;
    }
    public get title() {
        return this._title ? this._title : "Add";
    }

    private _title: string;
}

@Component({
    selector: "bl-add-task-button",
    template: `
        <bl-action-btn (action)="action.emit()" [disabled]="!enabled" [title]="title" icon="fa fa-plus">
        </bl-action-btn>
    `,
})
export class AddTaskButtonComponent extends BaseButton {
    @Input()
    public job: Job;

    @Input()
    public set title(value: string) {
        this._title = value;
    }
    public get title() {
        return this._title ? this._title : "Add";
    }

    public get enabled() {
        return this.job
            && this.job.state !== JobState.completed
            && this.job.state !== JobState.deleting
            && this.job.state !== JobState.disabled
            && this.job.state !== JobState.disabling
            && this.job.state !== JobState.terminating;
    }

    private _title: string;
}

@Component({
    selector: "bl-terminate-button",
    template: `
        <bl-action-btn (action)="action.emit()" [disabled]="!enabled" icon="fa fa-stop" title="Terminate">
        </bl-action-btn>
    `,
})
export class TerminateButtonComponent extends BaseButton {
    @Input()
    public entity: any;

    public get enabled() {
        return this.entity
            && this.entity.state !== JobState.completed
            && this.entity.state !== JobState.terminating
            && this.entity.state !== JobState.deleting;
    }
}

@Component({
    selector: "bl-delete-button",
    template: `
        <bl-action-btn (action)="action.emit()" [disabled]="!enabled" title="Delete" icon="fa fa-trash-o">
        </bl-action-btn>
    `,
})
export class DeleteButtonComponent extends BaseButton {
    @Input()
    public entity: any;

    public get enabled() {
        if (this.entity instanceof Job) {
            return this.entity
                && this.entity.state !== JobState.deleting
                && this.entity.state !== JobState.terminating;
        } else {
            return true;
        }
    }
}

@Component({
    selector: "bl-disable-button",
    template: `
        <bl-action-btn (action)="action.emit()" *ngIf="visible" icon="fa fa-pause"
            [disabled]="!enabled" title="Disable">
        </bl-action-btn>
    `,
})
export class DisableButtonComponent extends BaseButton {
    @Input()
    public job: Job;

    public get enabled() {
        return this.job
            && this.job.state === JobState.active;
    }

    public get visible() {
        return this.job
            && this.job.state !== JobState.disabling
            && this.job.state !== JobState.disabled;
    }
}

@Component({
    selector: "bl-enable-button",
    template: `
        <bl-action-btn *ngIf="visible" (action)="action.emit()" [disabled]="!enabled" title="Enable" icon="fa fa-play">
        </bl-action-btn>
    `,
})
export class EnableButtonComponent extends BaseButton {
    @Input()
    public job: Job;

    public get enabled() {
        return this.job && this.job.state === JobState.disabled;
    }

    public get visible() {
        return this.enabled;
    }
}

@Component({
    selector: "bl-clone-button",
    template: `<bl-action-btn (action)="action.emit()" [title]="title" icon="fa fa-clone"></bl-action-btn>`,
})
export class CloneButtonComponent extends BaseButton {
    @Input()
    public set title(value: string) {
        this._title = value;
    }
    public get title() {
        return this._title ? this._title : "Clone";
    }

    private _title: string;
}

@Component({
    selector: "bl-download-button",
    template: `
        <bl-action-btn (action)="action.emit()" [disabled]="!enabled" title="Download" icon="fa fa-download">
        </bl-action-btn>
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

    private _enabled: boolean;
}

@Component({
    selector: "bl-resize-button",
    template: `<bl-action-btn (action)="action.emit()" title="Resize" icon="fa fa-arrows-v"></bl-action-btn>`,
})
export class ResizeButtonComponent extends BaseButton {
}

@Component({
    selector: "bl-edit-button",
    template: `<bl-action-btn (action)="action.emit()" title="Edit" icon="fa fa-pencil-square-o"></bl-action-btn>`,
})
export class EditButtonComponent extends BaseButton {
}
