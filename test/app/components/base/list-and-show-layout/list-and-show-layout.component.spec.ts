import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule, MdDialog } from "@angular/material";
import { BrowserModule, By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { BreadcrumbModule, BreadcrumbService } from "app/components/base/breadcrumbs";
import { ListAndShowLayoutComponent } from "app/components/base/list-and-show-layout";
import { RefreshButtonComponent } from "app/components/base/refresh-btn";
import { ScrollableComponent } from "app/components/base/scrollable";
import { ScrollableService } from "app/components/base/scrollable";
import { FilterBuilder } from "app/utils/filter-builder";
import { click } from "test/utils/helpers";

@Component({
    template: `
        <bl-list-and-show-layout quickSearchField="url">
            <div bl-show-advanced-filter *ngIf="includeAdvancedFilter">
                Advanced filter Test
            </div>
        </bl-list-and-show-layout>
    `,
})
export class TestLayoutComponent {
    public includeAdvancedFilter = false;
}

fdescribe("ListAndShowLayout", () => {
    let fixture: ComponentFixture<TestLayoutComponent>;
    let de: DebugElement;
    let testComponent: TestLayoutComponent;
    let layoutComponent: ListAndShowLayoutComponent;
    let quickSearchInput: DebugElement;
    let activatedRouteSpy: any;

    beforeEach(() => {
        activatedRouteSpy = {
            queryParams: new BehaviorSubject({}),
        };
        let breadcrumbServiceSpy = {
            crumbs: new BehaviorSubject([]),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [
                TestLayoutComponent,
                ListAndShowLayoutComponent,
                ScrollableComponent,
                RefreshButtonComponent,
            ],
            providers: [
                ScrollableService,
                BreadcrumbService,
                { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: MdDialog, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestLayoutComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;

        de = fixture.debugElement;
        layoutComponent = de.query(By.css("bl-list-and-show-layout")).componentInstance;
        quickSearchInput = de.query(By.css(".quicksearch > input"));
    });

    describe("Filter", () => {
        it("Quick search should use the custom field specified", fakeAsync(() => {
            quickSearchInput.nativeElement.value = "abc";
            quickSearchInput.nativeElement.dispatchEvent(new Event("input"));
            expect(layoutComponent.filter.isEmpty()).toBe(true);

            // Should wait the debounce time
            tick(400);
            expect(layoutComponent.filter.toOData()).toBe("(startswith(url, 'abc'))");
        }));

        it("Triggering the advanced filter callback should update the filter", fakeAsync(() => {
            layoutComponent.advancedFilterChanged(FilterBuilder.prop("state").eq("running"));
            expect(layoutComponent.filter.toOData()).toBe("(state eq 'running')");

            quickSearchInput.nativeElement.value = "abc";
            quickSearchInput.nativeElement.dispatchEvent(new Event("input"));
            tick(400);
            expect(layoutComponent.filter.toOData()).toBe("(startswith(url, 'abc') and state eq 'running')");
        }));
    });

    describe("Advanced Filter", () => {
        it("should NOT show filter button if there is no advanced filter", () => {
            testComponent.includeAdvancedFilter = false;
            fixture.detectChanges();

            expect(de.query(By.css(".fa.fa-filter"))).toBeFalsy();
        });

        it("should show filter button if there is no advanced filter", () => {
            testComponent.includeAdvancedFilter = true;
            fixture.detectChanges();

            expect(de.query(By.css(".fa.fa-filter"))).not.toBeFalsy();
        });

        it("clicking on filter should open advanced filter", () => {
            testComponent.includeAdvancedFilter = true;
            fixture.detectChanges();
            const advFilterContent = "Advanced filter Test";
            const advancedFilterEl = de.query(By.css(".advanced-filter-content"));
            expect(advancedFilterEl).not.toBeVisible();

            const filterBtn = de.query(By.css(".fa.fa-filter"));
            click(filterBtn);
            fixture.detectChanges();

            expect(advancedFilterEl).toBeVisible();
            expect(advancedFilterEl.nativeElement.textContent).toContain("Advanced filter Test");

            click(filterBtn);
            fixture.detectChanges();
            expect(advancedFilterEl).not.toBeVisible();
        });
    });
});
