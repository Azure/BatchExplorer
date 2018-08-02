import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "@batch-flask/core";
import { Subscription } from "rxjs";

import { BatchApplication } from "app/models";
import { ApplicationDecorator } from "app/models/decorators";
import { ApplicationParams, ApplicationService } from "app/services";
import { EntityView } from "@batch-flask/core";
import { BatchApplicationCommands } from "../action";

@Component({
    selector: "bl-application-details",
    templateUrl: "application-details.html",
    providers: [BatchApplicationCommands],
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Application - ${tab}` : "Application";
        return {
            name: id,
            label,
        };
    }

    public application: BatchApplication;
    public applicationId: string;
    public decorator: ApplicationDecorator;
    public data: EntityView<BatchApplication, ApplicationParams>;

    private _paramsSubscriber: Subscription;

    constructor(
        public commands: BatchApplicationCommands,
        private activatedRoute: ActivatedRoute,
        private applicationService: ApplicationService,
        private router: Router) {

        this.data = this.applicationService.view();
        this.data.item.subscribe((application) => {
            this.application = application;
            if (application) {
                this.decorator = new ApplicationDecorator(application);
            }
        });

        this.data.deleted.subscribe((key) => {
            if (this.applicationId === key) {
                this.router.navigate(["/applications"]);
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.applicationId = params["id"];
            this.data.params = { id: this.applicationId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.data.dispose();
    }

    @autobind()
    public refresh() {
        return this.commands.get(this.applicationId);
    }
}
