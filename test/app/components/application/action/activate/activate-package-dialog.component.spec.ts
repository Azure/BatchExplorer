import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ActivatePackageDialogComponent } from "app/components/application/action";
import { ApplicationModule } from "app/components/application/application.module";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { ServerError } from "app/models";
import { ApplicationService } from "app/services";

describe("ActivatePackageDialogComponent ", () => {
    let fixture: ComponentFixture<ActivatePackageDialogComponent>;
    let component: ActivatePackageDialogComponent;
    let actionForm: ActionFormComponent;
    let debugElement: DebugElement;
    let dialogRefSpy: any;
    let appServiceSpy: any;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        appServiceSpy = {
            activatePackage: jasmine.createSpy("activatePackage").and.callFake((appId, version) => {
                if (appId === "bad-app-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return Observable.of({});
            }),
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule],
            providers: [
                { provide: MdDialogRef, useValue: dialogRefSpy },
                { provide: ApplicationService, useValue: appServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(ActivatePackageDialogComponent);
        component = fixture.componentInstance;
        component.applicationId = "app-1";
        component.packageVersion = "1.0";
        debugElement = fixture.debugElement;
        actionForm = fixture.debugElement.query(By.css("bl-action-form")).componentInstance;
        fixture.detectChanges();
    });

    it("Should show title and application id", () => {
        const description = "Do you want to manually activate the package 'app-1 - 1.0'";
        expect(debugElement.nativeElement.textContent).toContain("Activate package");
        expect(debugElement.nativeElement.textContent).toContain(description);
    });

    it("Submit should call service and close the dialog", () => {
        actionForm.performActionAndClose();

        expect(appServiceSpy.activatePackage).toHaveBeenCalledTimes(1);
        expect(appServiceSpy.activatePackage).toHaveBeenCalledWith("app-1", "1.0");
    });

    it("Submit should call service and show error if fails", () => {
        component.applicationId = "bad-app-id";
        fixture.detectChanges();

        actionForm.performActionAndClose();

        expect(appServiceSpy.activatePackage).toHaveBeenCalledTimes(1);
        expect(actionForm.error).not.toBeNull();
    });
});
