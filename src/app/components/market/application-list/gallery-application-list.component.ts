import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { Application } from "app/models";
import { NcjTemplateService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { map, startWith, switchMap, takeUntil } from "rxjs/operators";
import "./gallery-application-list.scss";

@Component({
    selector: "bl-gallery-application-list",
    templateUrl: "gallery-application-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryApplicationListComponent implements OnChanges, OnDestroy {
    @Input() public filter: string;

    public displayedApplications: List<any> = List([]);

    private _filter = new BehaviorSubject("");
    private _refresh = new Subject();
    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef, private templateService: NcjTemplateService) {
        this.templateService.listApplications();

        const applicationObs = this._refresh.pipe(
            startWith(null),
            takeUntil(this._destroy),
            switchMap(() => this.templateService.listApplications()),
        );

        combineLatest(applicationObs, this._filter).pipe(
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
        this._refresh.complete();
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
