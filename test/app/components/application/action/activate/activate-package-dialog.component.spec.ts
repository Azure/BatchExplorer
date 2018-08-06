import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { of, throwError } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { ActivatePackageDialogComponent } from "app/components/application/action";
import { ApplicationService } from "app/services";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("ActivatePackageDialogComponent ", () => {
    let fixture: ComponentFixture<ActivatePackageDialogComponent>;
    let component: ActivatePackageDialogComponent;
    let debugElement: DebugElement;
    let appServiceSpy: any;

    beforeEach(() => {
        appServiceSpy = {
            activatePackage: jasmine.createSpy("activatePackage").and.callFake((appId, version) => {
                if (appId === "bad-app-id") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return of({});
            }),
        };

        TestBed.configureTestingModule({
            imports: [],
            declarations: [SimpleFormMockComponent, ActivatePackageDialogComponent, ServerErrorMockComponent],
            providers: [
                { provide: MatDialogRef, useValue: null },
                { provide: ApplicationService, useValue: appServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(ActivatePackageDialogComponent);
        component = fixture.componentInstance;
        component.applicationId = "app-1";
        component.packageVersion = "1.0";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and application id", () => {
        const description = "Do you want to manually activate the package 'app-1 - 1.0'";
        expect(debugElement.nativeElement.textContent).toContain("Activate package");
        expect(debugElement.nativeElement.textContent).toContain(description);
    });

    it("Submit should call service", () => {
        component.ok().subscribe(() => {
            expect(appServiceSpy.activatePackage).toHaveBeenCalledTimes(1);
            expect(appServiceSpy.activatePackage).toHaveBeenCalledWith("app-1", "1.0");
        });
    });

    it("Submit should call service and show error if fails", () => {
        component.applicationId = "bad-app-id";
        fixture.detectChanges();

        component.ok().subscribe({
            error: () => {
                expect(appServiceSpy.activatePackage).toHaveBeenCalledTimes(1);

                const actionForm = fixture.debugElement.query(By.css("bl-simple-form")).componentInstance;
                expect(actionForm.error).not.toBeNull();
            },
        });
    });
});
