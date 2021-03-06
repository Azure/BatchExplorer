import {
    ChangeDetectionStrategy, Component, Injector, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Filter, FilterMatcher, ListSelection, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { Certificate, CertificateState } from "app/models";
import { CertificateListParams, CertificateService } from "app/services";
import { ComponentUtils } from "app/utils";
import { List } from "immutable";
import { Observable, Subscription, of } from "rxjs";
import { CertificateCommands } from "../action";

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
        activatedRoute: ActivatedRoute,
        injector: Injector,
        public commands: CertificateCommands,
        private certificateService: CertificateService,
    ) {
        super(injector);

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
        super.ngOnDestroy();
        this.data.dispose();
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

        return of(this.displayedCertificates.size);
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
        this.commands.delete.executeFromSelection(selection).subscribe();
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
