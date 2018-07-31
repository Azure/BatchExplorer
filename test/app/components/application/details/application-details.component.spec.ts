import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { BackgroundTaskService, DialogService, NotificationService, WorkspaceService } from "@batch-flask/ui";
import { Observable } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { ApplicationDetailsComponent } from "app/components/application/details";
import { BatchApplication } from "app/models";
import { ApplicationService, PinnedEntityService } from "app/services";
import * as Fixtures from "test/fixture";
import { ActivatedRouteMock, MockEntityView } from "test/utils/mocks";
import { LoadingMockComponent } from "test/utils/mocks/components";

// mock application properties component
@Component({
    selector: "bl-application-properties",
    template: "",
})
class ApplicationPropertiesMockComponent {
    @Input()
    public set application(application: BatchApplication) {
        this._application = application;
    }
    public get application() { return this._application; }

    private _application: BatchApplication;
}

// mock application packages component
@Component({
    selector: "bl-application-packages",
    template: "",
})
class ApplicationPackagesMockComponent {
    @Input()
    public application: BatchApplication;
}

// mock application error component
@Component({
    selector: "bl-application-error-display",
    template: "",
})
class ApplicationErrorDisplayMockComponent {
    @Input()
    public application: BatchApplication;
}

describe("ApplicationDetailsComponent.breadcrumb()", () => {
    it("has correct breadcrumb name", () => {
        const breadcrumb = ApplicationDetailsComponent.breadcrumb({ id: "app1" }, { tab: "details" });
        expect(breadcrumb.name).toEqual("app1");
        expect(breadcrumb.label).toEqual("Application - details");
    });
});

describe("ApplicationDetailsComponent", () => {
    let fixture: ComponentFixture<ApplicationDetailsComponent>;
    let component: ApplicationDetailsComponent;
    let entityView: MockEntityView<BatchApplication, any>;
    let applicationServiceSpy: any;
    let activatedRouteSpy: any;
    let matDialogSpy: any;

    beforeEach(() => {
        entityView = new MockEntityView(BatchApplication, {
            item: Fixtures.application.create({
                id: "app-1",
                displayName: "bobs display name",
                allowUpdates: true,
            }),
        });

        applicationServiceSpy = {
            view: () => entityView,
        };

        activatedRouteSpy = new ActivatedRouteMock({
            params: Observable.of({ id: "app-1" }),
        });

        matDialogSpy = {
            open: jasmine.createSpy("open-dialog").and.callFake((...args) => {
                return {
                    componentInstance: { applicationId: "" },
                };
            }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                ApplicationDetailsComponent, ApplicationPackagesMockComponent, ApplicationPropertiesMockComponent,
                ApplicationErrorDisplayMockComponent, LoadingMockComponent,
            ],
            providers: [
                { provide: DialogService, useValue: matDialogSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: SidebarManager, useValue: null },
                { provide: PinnedEntityService, useValue: null },
                { provide: NotificationService, useValue: null },
                { provide: BackgroundTaskService, useValue: null },
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: WorkspaceService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(ApplicationDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe("loads application based on initial parameter", () => {
        it("proxy params are set to correct id", () => {
            expect(entityView.params).toEqual({ id: "app-1" });
        });

        it("application was fetched", () => {
            expect(component.application).toBeDefined();
            expect(component.application.id).toEqual("app-1");
        });

        it("decorator is created", () => {
            expect(component.decorator).toBeDefined();
            expect(component.decorator.id).toEqual("app-1");
        });

        describe("UI shows correct information", () => {
            it("title is correct", () => {
                const container = fixture.debugElement.query(By.css("[summaryTitle]"));
                expect(container.nativeElement.textContent).toContain("app-1");
            });

            it("subtitle is correct", () => {
                const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
                expect(container.nativeElement.textContent).toContain("bobs display name");
            });

            it("subtitle contains unlocked text for this application", () => {
                const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
                expect(container.nativeElement.textContent).toContain("(unlocked)");
            });
        });

        describe("Locked application shows locked icon and text", () => {
            beforeEach(() => {
                component.application = Fixtures.application.create({ allowUpdates: false });
                fixture.detectChanges();
            });

            it("subtitle contains locked text", () => {
                const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
                expect(container.nativeElement.textContent).toContain("(locked)");
            });
        });
    });
});
