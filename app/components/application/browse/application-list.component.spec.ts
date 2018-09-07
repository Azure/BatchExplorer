import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { FilterBuilder } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ActivityService } from "@batch-flask/ui/activity";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { WorkspaceService } from "@batch-flask/ui/workspace";
import { ApplicationListComponent } from "app/components/application/browse";
import { BatchApplication } from "app/models";
import { ApplicationService, PinnedEntityService } from "app/services";
import { Subject } from "rxjs";
import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

describe("ApplicationListComponent", () => {
    let fixture: ComponentFixture<ApplicationListComponent>;
    let component: ApplicationListComponent;
    let listProxy: MockListView<BatchApplication, {}>;
    let applicationServiceSpy: any;
    let pinServiceSpy;

    beforeEach(() => {
        listProxy = new MockListView(BatchApplication, {
            cacheKey: "id",
            items: [
                Fixtures.application.create({ id: "app-1" }),
                Fixtures.application.create({ id: "app-2" }),
                Fixtures.application.create({ id: "app-3" }),
            ],
        });

        applicationServiceSpy = {
            listView: () => listProxy,
            onApplicationAdded: new Subject(),
        };

        pinServiceSpy = {
            isFavorite: jasmine.createSpy("isFavorite"),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, I18nTestingModule],
            declarations: [ApplicationListComponent, NoItemMockComponent],
            providers: [
                { provide: DialogService, useValue: null },
                { provide: NotificationService, useValue: null },
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: PinnedEntityService, useValue: pinServiceSpy },
                { provide: ActivityService, useValue: null },
                { provide: SidebarManager, useValue: null },
                { provide: WorkspaceService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(ApplicationListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should have 3 applications", () => {
        expect(component.applications.size).toEqual(3);
        expect(component.displayedApplications.size).toEqual(3);
    });

    describe("filters displayed applications", () => {
        it("listProxy doesnt filter", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("app-1"), FilterBuilder.none());
            expect(component.data.options.isEmpty()).toBe(true);
            expect(listProxy.options.isEmpty()).toBe(true);
        });

        it("applied filter does client filtering", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("app-1"), FilterBuilder.none());
            fixture.detectChanges();

            expect(listProxy.options.isEmpty()).toBe(true);
            expect(component.displayedApplications.size).toEqual(1);
            expect(component.applications.size).toEqual(3);
        });

        it("no filter results shows no results message", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("banana"), FilterBuilder.none());
            fixture.detectChanges();

            expect(component.displayedApplications.size).toEqual(0);

            const property = fixture.debugElement.query(By.css("bl-no-item"));
            expect(property.nativeElement.textContent).toContain("Current filter returned no applications");
        });
    });
});
