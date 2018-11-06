import { HttpErrorResponse } from "@angular/common/http";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ServerError } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { ApplicationEditDialogComponent } from "app/components/application/action";
import { ApplicationService } from "app/services";
import { of, throwError } from "rxjs";
import * as Fixtures from "test/fixture";
import * as TestConstants from "test/test-constants";
import { validateControl } from "test/utils/helpers";
import { ServerErrorMockComponent, complexFormMockComponents } from "test/utils/mocks/components";

describe("ApplicationEditDialogComponent ", () => {
    let fixture: ComponentFixture<ApplicationEditDialogComponent>;
    let component: ApplicationEditDialogComponent;
    let debugElement: DebugElement;
    let appServiceSpy: any;
    let notificationServiceSpy: any;

    const validators = TestConstants.validators;

    beforeEach(() => {
        appServiceSpy = {
            patch: jasmine.createSpy("patch").and.callFake((applicationId: string, jsonData: any) => {
                if (applicationId === "throw-me") {
                    return throwError(ServerError.fromARM(new HttpErrorResponse({
                        status: 400,
                        error: { error: { message: "blast, we failed" } },
                        statusText: "Bad request",
                    })));
                }

                return of({});
            }),
        };

        notificationServiceSpy = {
            success: jasmine.createSpy("success"),

            error: jasmine.createSpy("error"),
        };

        TestBed.configureTestingModule({
            declarations: [...complexFormMockComponents, ApplicationEditDialogComponent, ServerErrorMockComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: null },
                { provide: ApplicationService, useValue: appServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(ApplicationEditDialogComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and description", () => {
        expect(debugElement.nativeElement.textContent).toContain("Edit application");
        expect(debugElement.nativeElement.textContent).toContain("Update the display name, default version"
            + ", or locked status of your application");
    });

    describe("display name", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("input[formControlName=displayName]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has no required validation", () => {
            const controlId = "displayName";
            validateControl(component.form, controlId).passes(validators.required).with("");
            validateControl(component.form, controlId).passes(validators.required).with(null);
        });

        it("control has maxLength validation", () => {
            const controlId = "displayName";
            validateControl(component.form, controlId).fails(validators.maxlength).with("a".repeat(1025));
            validateControl(component.form, controlId).passes(validators.maxlength).with("a".repeat(1024));
        });
    });

    describe("default version", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("bl-select[formControlName=defaultVersion]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has no validation", () => {
            const controlId = "defaultVersion";
            validateControl(component.form, controlId).passes(validators.required).with("");
            validateControl(component.form, controlId).passes(validators.required).with(null);
        });
    });

    describe("Package File", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("mat-radio-group[formControlName=allowUpdates]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has required validation", () => {
            validateControl(component.form, "allowUpdates").passes(validators.required).with(false);
            validateControl(component.form, "allowUpdates").passes(validators.required).with(true);
            validateControl(component.form, "allowUpdates").fails(validators.required).with(null);
            validateControl(component.form, "allowUpdates").fails(validators.required).with("");
        });
    });

    describe("Passing in application populates form", () => {
        beforeEach(() => {
            component.setValue(Fixtures.application.create({
                id: "monkeys",
                displayName: "my monkey",
                defaultVersion: "1.0.1",
                allowUpdates: true,
                packages: [
                    Fixtures.applicationPackage.create({ version: "1.0.1" }),
                    Fixtures.applicationPackage.create({ version: "1.0.2" }),
                ],
            }));

            fixture.detectChanges();
        });

        it("sets the application", () => {
            expect(component.application.id).toBe("monkeys");
        });

        it("sets the package collection", () => {
            expect(component.packages.size).toBe(2);
        });

        it("sets the display name", () => {
            expect(component.form.controls["displayName"].value).toBe("my monkey");
        });

        it("sets the default version", () => {
            expect(component.form.controls["defaultVersion"].value).toBe("1.0.1");
        });

        it("sets allow updates", () => {
            expect(component.form.controls["allowUpdates"].value).toBe(true);
        });
    });

    describe("Submitting action form", () => {
        beforeEach(() => {
            component.setValue(Fixtures.application.create({
                id: "monkeys-2.0",
                displayName: "monkey magic",
                defaultVersion: "1.0.1",
                allowUpdates: true,
            }));

            fixture.detectChanges();
        });

        it("Clicking add updates app but doesn't close sidebar", (done) => {
            component.submit().subscribe(() => {
                expect(appServiceSpy.patch).toHaveBeenCalledTimes(1);
                expect(appServiceSpy.patch).toHaveBeenCalledWith("monkeys-2.0", {
                    displayName: "monkey magic",
                    defaultVersion: "1.0.1",
                    allowUpdates: true,
                });

                expect(notificationServiceSpy.error).toHaveBeenCalledTimes(0);
                expect(notificationServiceSpy.success).toHaveBeenCalledTimes(1);
                expect(notificationServiceSpy.success).toHaveBeenCalledWith(
                    "Application updated!",
                    "Application monkeys-2.0 was successfully updated!",
                );

                done();
            });
        });

        it("If edit application throws we handle the error", (done) => {
            component.application = Fixtures.application.create({
                id: "throw-me",
                displayName: "monkey magic",
                defaultVersion: "1.0.1",
                allowUpdates: true,
            });

            fixture.detectChanges();

            component.submit().subscribe({
                next: () => {
                    fail("call should have failed");
                    done();
                },
                error: (error: ServerError) => {
                    expect(error.statusText).toBe("Bad request");
                    expect(error.toString()).toBe("400 - Bad request - blast, we failed");

                    expect(appServiceSpy.patch).toHaveBeenCalledTimes(1);
                    expect(notificationServiceSpy.success).toHaveBeenCalledTimes(0);
                    expect(notificationServiceSpy.error).toHaveBeenCalledTimes(1);
                    expect(notificationServiceSpy.error).toHaveBeenCalledWith(
                        "Update failed",
                        "The application failed to update successfully",
                    );

                    done();
                },
            });
        });
    });
});
