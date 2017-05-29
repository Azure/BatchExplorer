import { Component, Input } from "@angular/core";

import { Job, JobState } from "app/models";

@Component({
    selector: "bl-loading-button",
    template: `
        <bl-action-btn color="primary">
            <ng-content *ngIf="!loading"></ng-content>
            <i class="fa fa-spinner fa-spin" *ngIf="loading"></i>
        </bl-action-btn>
    `,
})
export class LoadingButtonComponent {
    @Input()
    public loading: boolean = false;
}

@Component({
    selector: "bl-clear-list-selection",
    template: `
        <bl-action-btn color="accent" (click)="onClick()" md-tooltip="Clear selection">
            <i class="fa fa-check-square-o"></i>
        </bl-action-btn>
    `,
})
export class ClearListSelectionButtonComponent {
    @Input()
    public list: any;

    public onClick() {
        this.list.clearSelection();
    }
}

/**
 * Would be nice to be able to have an abstract base component that held the
 * button template and we just called super("Add", "fa-icon").
 */
@Component({
    selector: "bl-add-button",
    template: `<bl-action-btn icon="fa fa-plus" [title]="title"></bl-action-btn>`,
})
export class AddButtonComponent {
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
    template: `<bl-action-btn [disabled]="!enabled"><i class="fa fa-plus"></i> {{title}}</bl-action-btn>`,
})
export class AddTaskButtonComponent {
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
    template: `<bl-action-btn [disabled]="!enabled"><i class="fa fa-times"></i> Terminate</bl-action-btn>`,
})
export class TerminateButtonComponent {
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
    template: `<bl-action-btn [disabled]="!enabled" title="Delete" icon="fa fa-trash-o"></bl-action-btn>`,
})
export class DeleteButtonComponent {
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
        <bl-action-btn *ngIf="visible" icon="fa fa-pause" [disabled]="!enabled" title="Disable">
        </bl-action-btn>
    `,
})
export class DisableButtonComponent {
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
        <bl-action-btn *ngIf="visible" [disabled]="!enabled" title="Enable" icon="fa fa-play"></bl-action-btn>
    `,
})
export class EnableButtonComponent {
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
    template: `<bl-action-btn [title]="title" icon="fa fa-clone"></bl-action-btn>`,
})
export class CloneButtonComponent {
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
    template: `<bl-action-btn [disabled]="!enabled" title="Download" icon="fa fa-download"></bl-action-btn>`,
})
export class DownloadButtonComponent {
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
    template: `<bl-action-btn title="Resize" icon="fa fa-arrows-v"></bl-action-btn>`,
})
export class ResizeButtonComponent {
}

@Component({
    selector: "bl-edit-button",
    template: `<bl-action-btn title="Edit" icon="fa fa-pencil-square-o"></bl-action-btn>`,
})
export class EditButtonComponent {
}
