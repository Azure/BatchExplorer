import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EntityView, autobind } from "@batch-flask/core";
import { BatchApplication } from "app/models";
import { ApplicationParams, BatchApplicationService } from "app/services";
import { Subscription } from "rxjs";
import { BatchApplicationCommands } from "../action";

@Component({
    selector: "bl-application-details",
    templateUrl: "application-details.html",
    providers: [BatchApplicationCommands],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }, { tab }) {
        const label = tab ? `Application - ${tab}` : "Application";
        let name;
        if (id) {
            const split = id.split("/");
            name = split[split.length - 1];
        }
        return { name: name, label };
    }

    public application: BatchApplication;
    public applicationId: string;
    public data: EntityView<BatchApplication, ApplicationParams>;

    private _paramsSubscriber: Subscription;

    constructor(
        public commands: BatchApplicationCommands,
        private activatedRoute: ActivatedRoute,
        private applicationService: BatchApplicationService,
        private changeDetector: ChangeDetectorRef,
        private router: Router) {

        this.data = this.applicationService.view();
        this.data.item.subscribe((application) => {
            this.application = application;
            this.changeDetector.markForCheck();
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
