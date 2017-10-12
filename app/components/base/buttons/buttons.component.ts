import { Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { ButtonAction } from "./button.component";

import { Job, JobState } from "app/models";

export class BaseButton {
    @Input() public action: ButtonAction;
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
    template: `<bl-button color="light" icon="fa fa-plus" [title]="title" [action]="action"></bl-button>`,
})
export class AddButtonComponent extends BaseButton {
    @Input()
    public title: string = "Add";
}

@Component({
    selector: "bl-add-task-button",
    template: `
        <bl-button color="light" [action]="action" [disabled]="!enabled" [title]="title" icon="fa fa-plus">
        </bl-button>
    `,
})
export class AddTaskButtonComponent extends BaseButton {
    @Input()
    public job: Job;

    @Input()
    public title: string = "Add";

    public get enabled() {
        return this.job
            && this.job.state !== JobState.completed
            && this.job.state !== JobState.deleting
            && this.job.state !== JobState.disabled
            && this.job.state !== JobState.disabling
            && this.job.state !== JobState.terminating;
    }
}

@Component({
    selector: "bl-terminate-button",
    template: `
        <bl-button color="light" [action]="action" [disabled]="!enabled" icon="fa fa-stop" title="Terminate">
        </bl-button>
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
        <bl-button color="light" [action]="action" [disabled]="!enabled" [title]="title" icon="fa fa-trash-o">
        </bl-button>
    `,
})
export class DeleteButtonComponent extends BaseButton {
    @Input()
    public entity: any;

    @Input()
    public title: string = "Delete";

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
        <bl-button color="light" [action]="action" *ngIf="visible" icon="fa fa-pause"
            [disabled]="!enabled" title="Disable">
        </bl-button>
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
        <bl-button color="light" *ngIf="visible" [action]="action" [disabled]="!enabled" title="Enable"
            icon="fa fa-play">
        </bl-button>
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
    template: `<bl-button color="light" [action]="action" [title]="title" icon="fa fa-clone"></bl-button>`,
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
    template: `<bl-button color="light" [action]="action" title="Resize" icon="fa fa-arrows-v"></bl-button>`,
})
export class ResizeButtonComponent extends BaseButton {
}

@Component({
    selector: "bl-edit-button",
    template: `<bl-button color="light" [action]="action" [title]="title" icon="fa fa-pencil-square-o"></bl-button>`,
})
export class EditButtonComponent extends BaseButton {
    @Input()
    public title: string = "Edit";
}
