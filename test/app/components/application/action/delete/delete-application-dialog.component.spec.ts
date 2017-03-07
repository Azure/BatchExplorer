import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { DeleteApplicationDialogComponent } from "app/components/application/action";
import { ApplicationModule } from "app/components/application/application.module";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { Application, ServerError } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { RxMockEntityProxy } from "test/utils/mocks";

xdescribe("DeleteApplicationDialogComponent ", () => {
    let fixture: ComponentFixture<DeleteApplicationDialogComponent>;
    let component: DeleteApplicationDialogComponent;
    let entityProxy: RxMockEntityProxy<any, Application>;
    let actionForm: ActionFormComponent;
    let debugElement: DebugElement;
    let dialogRefSpy: any;
    let appServiceSpy: any;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        entityProxy = new RxMockEntityProxy(Application, {
            item: Fixtures.application.create({ id: "app-1" }),
        });

        appServiceSpy = {
            delete: jasmine.createSpy("delete").and.callFake((appId) => {
                if (appId === "bad-app-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return Observable.of({});
            }),

            getOnce: () => Observable.of(Fixtures.application.create({ id: "app-1"})),

            get: () => entityProxy,
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule],
            providers: [
                { provide: MdDialogRef, useValue: dialogRefSpy },
                { provide: ApplicationService, useValue: appServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(DeleteApplicationDialogComponent);
        component = fixture.componentInstance;
        component.applicationId = "app-1";
        actionForm = fixture.debugElement.query(By.css("bl-action-form")).componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and application id", () => {
        const description = "Do you want to delete the application: 'app-1'";
        expect(debugElement.nativeElement.textContent).toContain("Delete application");
        expect(debugElement.nativeElement.textContent).toContain(description);
    });

    it("Submit should call service and close the dialog", () => {
        actionForm.performActionAndClose();

        expect(appServiceSpy.delete).toHaveBeenCalledTimes(1);
        expect(appServiceSpy.delete).toHaveBeenCalledWith("app-1");
    });

    it("Submit should call service and show error if fails", () => {
        component.applicationId = "bad-app-id";
        fixture.detectChanges();

        actionForm.performActionAndClose();

        expect(appServiceSpy.delete).toHaveBeenCalledTimes(1);
        expect(actionForm.error).not.toBeNull();
    });
});
