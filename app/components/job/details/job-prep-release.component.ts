import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";

import { JobDecorator, JobPreparationTaskDecorator, JobReleaseTaskDecorator } from "app/models/decorators";

@Component({
    selector: "bex-job-prep-release",
    templateUrl: "job-prep-release.html",
})

export class JobPrepReleaseComponent implements OnDestroy {
    @Input()
    public set jobDecorator(decorator: JobDecorator) {
        this._decorator = decorator;
        this.refresh();
    }
    public get jobDecorator() { return this._decorator; }

    public prepTask: JobPreparationTaskDecorator = <any>{};
    public releaseTask: JobReleaseTaskDecorator = <any>{};

    private _decorator: JobDecorator;

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    public refresh() {
        if (this.jobDecorator) {
            this.prepTask = this.jobDecorator.jobPreparationTask;
            this.releaseTask = this.jobDecorator.jobReleaseTask;
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}
