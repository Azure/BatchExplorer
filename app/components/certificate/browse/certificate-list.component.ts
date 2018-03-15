import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
// import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
// import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { Certificate, CertificateState } from "app/models";
import { CertificateListParams, CertificateService, PinnedEntityService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
// import {
//     DeleteCertificateAction,
//     DeleteCertificateDialogComponent,
//     DisableCertificateDialogComponent,
//     EnableCertificateDialogComponent,
//     TerminateCertificateDialogComponent,
// } from "../action";

@Component({
    selector: "bl-certificate-list",
    templateUrl: "certificate-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => CertificateListComponent),
    }],
})
export class CertificateListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public certificates: List<Certificate>;
    public LoadingStatus = LoadingStatus;

    public data: ListView<Certificate, CertificateListParams>;
    public searchQuery = new FormControl();

    private _baseOptions = {};
    private _onCertificateAddedSub: Subscription;

    constructor(
        router: Router,
        activatedRoute: ActivatedRoute,
        changeDetector: ChangeDetectorRef,
        // private dialog: MatDialog,
        private certificateService: CertificateService,
        private pinnedEntityService: PinnedEntityService,
        // private taskManager: BackgroundTaskService
    ) {
        super(changeDetector);
        this.data = this.certificateService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);
        this.data.items.subscribe((certificates) => {
            this.certificates = certificates;
            this.changeDetector.markForCheck();
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
        if (filter.isEmpty()) {
            this.data.setOptions({ ...this._baseOptions });
        } else {
            this.data.setOptions({ ...this._baseOptions, filter: filter.toOData() });
        }

        this.data.fetchNext();
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
                return `Certficate is ${certificate.state}`;
        }
    }

    public onScrollToBottom() {
        this.data.fetchNext();
    }

    public contextmenu(certificate: Certificate) {
        const deletefailed = certificate.state === CertificateState.deletefailed;
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => {} /*this.deleteCertificate(certificate)*/ }),
            new ContextMenuItem({
                label: "Reactivate",
                click: () => {}, // this.terminateCertificate(certificate),
                enabled: deletefailed,
            }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(certificate) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinCertificate(certificate),
            }),
        ]);
    }

    public deleteSelection(selection: ListSelection) {
        // this.taskManager.startTask("", (backgroundTask) => {
        //     const task = new DeleteCertificateAction(this.certificateService, [...selection.keys]);
        //     task.start(backgroundTask);
        //     return task.waitingDone;
        // });
    }

    public deleteCertificate(certificate: Certificate) {
        // const dialogRef = this.dialog.open(DeleteCertificateDialogComponent);
        // dialogRef.componentInstance.certificateId = certificate.id;
        // dialogRef.afterClosed().subscribe((obj) => {
        //     this.certificateService.get(certificate.id);
        // });
    }

    public trackByFn(index: number, certificate: Certificate) {
        return certificate.thumbprint;
    }

    private _pinCertificate(certificate: Certificate) {
        this.pinnedEntityService.pinFavorite(certificate).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(certificate);
            }
        });
    }
}
