import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LoadingStatus } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SortingStatus } from "@batch-flask/ui/abstract-list/list-data-sorter";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { BehaviorSubject, Subject, of } from "rxjs";
import { click } from "test/utils/helpers";
import { runAxe } from "test/utils/helpers/axe-helpers";
import { PartialSortWarningComponent } from "./partial-sort-warning.component";

@Component({
    template: `<bl-partial-sort-warning [data]="data" [presenter]="presenter"></bl-partial-sort-warning>`,
})
class TestComponent {
    public data: {
        fetchAll: jasmine.Spy;
        status: BehaviorSubject<LoadingStatus>,
    };
    public presenter: {
        autoUpdating: BehaviorSubject<boolean>,
        sortingStatus: BehaviorSubject<SortingStatus>,
        update: jasmine.Spy;
    };

    public fetchAllSubject = new Subject();

    constructor() {
        this.data = {
            fetchAll: jasmine.createSpy("fetchAll").and.returnValue(this.fetchAllSubject),
            status: new BehaviorSubject(LoadingStatus.Ready),
        };
        this.presenter = {
            autoUpdating: new BehaviorSubject(true),
            sortingStatus: new BehaviorSubject(SortingStatus.Valid),
            update: jasmine.createSpy("update").and.returnValue(of(null)),
        };
    }
}

describe("PartialSortWarningComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [PartialSortWarningComponent, TestComponent, ClickableComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-partial-sort-warning"));
        fixture.detectChanges();
    });

    it("it doesn't show anything when sorting status is valid and is autoupdating", () => {
        expect(de.query(By.css(".partial-sort-warning"))).toBeFalsy();
        expect(de.query(By.css(".auto-update-warning"))).toBeFalsy();
    });

    it("should pass accessibility test", async () => {
        expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
    });

    describe("when sorting is partial", () => {
        beforeEach(() => {
            testComponent.presenter.sortingStatus.next(SortingStatus.Partial);
            fixture.detectChanges();
        });

        it("it does NOT show partial sort warnning when data is still loading", () => {
            testComponent.data.status.next(LoadingStatus.Loading);
            fixture.detectChanges();

            expect(de.query(By.css(".partial-sort-warning"))).toBeFalsy();
            expect(de.query(By.css(".auto-update-warning"))).toBeFalsy();
        });

        it("it show partial sort warnning when sorting is partial", () => {
            expect(de.query(By.css(".partial-sort-warning"))).not.toBeFalsy();
            expect(de.query(By.css(".auto-update-warning"))).toBeFalsy();
        });

        it("it start loading all items when clicking on it", () => {
            const btn = de.query(By.css(".partial-sort-warning .action"));
            expect(btn).not.toBeFalsy();
            click(btn);

            expect(testComponent.data.fetchAll).toHaveBeenCalledOnce();
            testComponent.data.status.next(LoadingStatus.Loading);
            fixture.detectChanges();

            expect(de.query(By.css(".partial-sort-warning"))).not.toBeFalsy();
            expect(de.query(By.css(".auto-update-warning"))).toBeFalsy();

            testComponent.fetchAllSubject.next(null);
            testComponent.data.status.next(LoadingStatus.Ready);
            testComponent.presenter.sortingStatus.next(SortingStatus.Valid);
            fixture.detectChanges();

            expect(de.query(By.css(".partial-sort-warning"))).toBeFalsy();
            expect(de.query(By.css(".auto-update-warning"))).toBeFalsy();
        });

        it("should pass accessibility test", async () => {
            expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe("when auto upodate", () => {
        beforeEach(() => {
            testComponent.presenter.autoUpdating.next(false);
            fixture.detectChanges();
        });

        it("it show partial sort warnning when sorting is partial", () => {
            expect(de.query(By.css(".partial-sort-warning"))).toBeFalsy();
            expect(de.query(By.css(".auto-update-warning"))).not.toBeFalsy();
        });

        it("it start loading all items when clicking on it", () => {
            const btn = de.query(By.css(".auto-update-warning .action"));
            expect(btn).not.toBeFalsy();
            click(btn);

            expect(testComponent.presenter.update).toHaveBeenCalledOnce();
        });

        it("should pass accessibility test", async () => {
            expect(await runAxe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
});
