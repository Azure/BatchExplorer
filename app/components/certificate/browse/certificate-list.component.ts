import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, FilterMatcher, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { Certificate, CertificateState } from "app/models";
import { CertificateListParams, CertificateService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import {
    CertificateCommands, DeleteCertificateAction,
} from "../action";

@Component({
    selector: "bl-certificate-list",
    templateUrl: "certificate-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CertificateCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => CertificateListComponent),
    }],
})
export class CertificateListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public certificates: List<Certificate>;
    public displayedCertificates: List<Certificate> = List([]);
    public LoadingStatus = LoadingStatus;
    public data: ListView<Certificate, CertificateListParams>;
    public searchQuery = new FormControl();

    private _onCertificateAddedSub: Subscription;

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        public commands: CertificateCommands,
        private certificateService: CertificateService,
        private taskManager: BackgroundTaskService,
    ) {
        super(changeDetector);

        this.data = this.certificateService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
        this.data.items.subscribe((certificates) => {
            this.certificates = certificates;
            this._updateDisplayedCertificates();
        });

        this.data.status.subscribe((status) => {
            this.status = status;
        });

        this._onCertificateAddedSub = certificateService.onCertificateAdded.subscribe((certificateId) => {
            this.data.loadNewItem(certificateService.get(certificateId));
        });
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        if (this._onCertificateAddedSub) {
            this._onCertificateAddedSub.unsubscribe();
        }
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        this._updateDisplayedCertificates();
    }

    public certificateStatus(certificate: Certificate): QuickListItemStatus {
        switch (certificate.state) {
            case CertificateState.active:
                return QuickListItemStatus.normal;
            case CertificateState.deletefailed:
                return QuickListItemStatus.accent;
            case CertificateState.deleting:
                return QuickListItemStatus.important;
            default:
                return QuickListItemStatus.normal;
        }
    }

    public certificateStatusText(certificate: Certificate): string {
        switch (certificate.state) {
            case CertificateState.active:
                return "";
            default:
                return `Certificate is ${certificate.state}`;
        }
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteCertificateAction(this.certificateService, [...selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });

        // // ActivityService Code
        // const initializer = () => {
        //     return of(Array.from(selection.keys)).pipe(
        //         map(keyList => {
        //             return keyList.map(key => {
        //                 return new Activity(`Deleting Certificate '${key}'`, () => {
        //                     return this.certificateService.delete(key);
        //                 }, () => {
        //                     this.refresh();
        //                 });
        //             });
        //         }),
        //     );
        // };

        // this.activityService.loadAndRun(new Activity("Deleting Certificates", initializer));
    }

    public trackByFn(index: number, certificate: Certificate) {
        return certificate.thumbprint;
    }

    private _updateDisplayedCertificates() {
        const matcher = new FilterMatcher<Certificate>();
        this.displayedCertificates = List<Certificate>(this.certificates.filter((x) => {
            return matcher.test(this.filter, x);
        }));
        this.changeDetector.markForCheck();
    }
}
