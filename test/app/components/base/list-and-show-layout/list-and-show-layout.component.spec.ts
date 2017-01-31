import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule, MdDialog } from "@angular/material";
import { BrowserModule, By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import { BreadcrumbGroupComponent, BreadcrumbService } from "app/components/base/breadcrumbs";
import { ListAndShowLayoutComponent } from "app/components/base/list-and-show-layout";
import { RefreshButtonComponent } from "app/components/base/refresh-btn";
import { ScrollableComponent } from "app/components/base/scrollable";
import { ScrollableService } from "app/components/base/scrollable";
import { FilterBuilder } from "app/utils/filter-builder";

@Component({
    template: `
        <bex-list-and-show-layout quickSearchField="url">

        </bex-list-and-show-layout>
    `,
})
export class TestLayoutComponent {

}

describe("ListAndShowLayout", () => {
    let fixture: ComponentFixture<TestLayoutComponent>;
    let de: DebugElement;
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
            imports: [BrowserModule, FormsModule, ReactiveFormsModule, MaterialModule],
            declarations: [
                TestLayoutComponent,
                ListAndShowLayoutComponent,
                ScrollableComponent,
                RefreshButtonComponent,
                BreadcrumbGroupComponent,
            ],
            providers: [
                ScrollableService,
                BreadcrumbService,
                { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: MdDialog, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(TestLayoutComponent);
        fixture.detectChanges();

        de = fixture.debugElement;
        layoutComponent = de.query(By.css("bex-list-and-show-layout")).componentInstance;
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
});
