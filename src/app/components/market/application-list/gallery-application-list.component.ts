import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    EventEmitter, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { Application } from "app/models";
import { NcjTemplateService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import "./gallery-application-list.scss";

export interface ApplicationSelection {
    portfolioId: string;
    applicationId: string;
}

@Component({
    selector: "bl-gallery-application-list",
    templateUrl: "gallery-application-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryApplicationListComponent implements OnChanges, OnDestroy {
    @Input() public filter: string;
    @Input() public active: ApplicationSelection;
    @Output() public activeChange = new EventEmitter<ApplicationSelection>();

    public displayedApplications: List<any> = List([]);

    private _filter = new BehaviorSubject("");
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private templateService: NcjTemplateService) {
        combineLatest(this.templateService.applications, this._filter).pipe(
            takeUntil(this._destroy),
            map(([applications, filter]) => this._filterApplications(applications, filter)),
        ).subscribe((applications) => {
            this.displayedApplications = applications;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.filter) {
            this._filter.next(this.filter);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public selectApplication(application: Application) {
        this.active = {
            portfolioId: application.portfolioId,
            applicationId: application.id,
        };

        this.activeChange.emit(this.active);
        this.changeDetector.markForCheck();
    }
    /**
     * Filter all the application according to the current filter.
     * It will set the displayedApplication.
     */
    private _filterApplications(applications: List<Application>, filter: string): List<Application> {
        if (!applications) {
            return List([]);
        }

        return List(applications.filter((application) => {
            const query = filter.clearWhitespace().toLowerCase();
            return query === ""
                || application.id.clearWhitespace().toLowerCase().contains(query)
                || application.name.clearWhitespace().toLowerCase().contains(query);
        }));
    }
}
