import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import {  of, throwError } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DeleteApplicationDialogComponent } from "app/components/application/action";
import { BatchApplication } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { MockEntityView } from "test/utils/mocks";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

// TODO: 2 tests excluded below. Needs long running action refactor for testing
describe("DeleteApplicationDialogComponent ", () => {
    let fixture: ComponentFixture<DeleteApplicationDialogComponent>;
    let component: DeleteApplicationDialogComponent;
    let entityView: MockEntityView<BatchApplication, any>;
    let debugElement: DebugElement;
    let appServiceSpy: any;

    beforeEach(() => {
        entityView = new MockEntityView(BatchApplication, {
            item: Fixtures.application.create({ id: "app-1" }),
        });

        appServiceSpy = {
            delete: jasmine.createSpy("delete").and.callFake((appId) => {
                if (appId === "bad-app-id") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return of({});
            }),

            get: () => of(Fixtures.application.create({ id: "app-1" })),
            view: () => entityView,
        };

        TestBed.configureTestingModule({
            declarations: [SimpleFormMockComponent, DeleteApplicationDialogComponent, ServerErrorMockComponent],
            providers: [
                { provide: MatDialogRef, useValue: null },
                { provide: ApplicationService, useValue: appServiceSpy },
                { provide: BackgroundTaskService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(DeleteApplicationDialogComponent);
        component = fixture.componentInstance;
        component.applicationId = "app-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and application id", () => {
        const description = "Do you want to delete the application: 'app-1'";
        expect(debugElement.nativeElement.textContent).toContain("Delete application");
        expect(debugElement.nativeElement.textContent).toContain(description);
    });

    xit("Submit should call service and close the dialog", () => {
        component.destroyApplication().subscribe(() => {
            expect(appServiceSpy.delete).toHaveBeenCalledTimes(1);
            expect(appServiceSpy.delete).toHaveBeenCalledWith("app-1");
        });
    });

    xit("Submit should call service and show error if fails", () => {
        component.applicationId = "bad-app-id";
        fixture.detectChanges();

        component.destroyApplication().subscribe({
            error: () => {
                expect(appServiceSpy.delete).toHaveBeenCalledTimes(1);

                const actionForm = fixture.debugElement.query(By.css("bl-simple-form")).componentInstance;
                expect(actionForm.error).not.toBeNull();
            },
        });
    });
});
