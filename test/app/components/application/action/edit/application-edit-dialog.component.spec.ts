import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { Response, ResponseOptions } from "@angular/http";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ApplicationEditDialogComponent } from "app/components/application/action";
import { ApplicationModule } from "app/components/application/application.module";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { ServerError } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import * as TestConstants from "test/test-constants";
import { validateControl } from "test/utils/helpers";

describe("ApplicationEditDialogComponent ", () => {
    let fixture: ComponentFixture<ApplicationEditDialogComponent>;
    let component: ApplicationEditDialogComponent;
    let debugElement: DebugElement;
    let applicationForm: any;
    let sidebarRefSpy: any;
    let appServiceSpy: any;
    let notificationServiceSpy: any;

    const validators = TestConstants.validators;

    beforeEach(() => {
        sidebarRefSpy = {
            close: jasmine.createSpy("close"),
        };

        appServiceSpy = {
            patch: jasmine.createSpy("patch").and.callFake((applicationId: string, jsonData: any) => {
                if (applicationId === "throw-me") {
                    return Observable.throw(ServerError.fromARM(new Response(new ResponseOptions({
                        status: 400,
                        body: JSON.stringify({ message: "blast, we failed" }),
                        statusText: "error, error, error",
                    }))));
                }

                return Observable.of({});
            }),
        };

        notificationServiceSpy = {
            success: jasmine.createSpy("success"),

            error: jasmine.createSpy("error"),
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: ApplicationService, useValue: appServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(ApplicationEditDialogComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();

        applicationForm = component.applicationForm;
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
            validateControl(applicationForm, controlId).passes(validators.required).with("");
            validateControl(applicationForm, controlId).passes(validators.required).with(null);
        });

        it("control has maxLength validation", () => {
            const controlId = "displayName";
            validateControl(applicationForm, controlId).fails(validators.maxlength).with("a".repeat(1025));
            validateControl(applicationForm, controlId).passes(validators.maxlength).with("a".repeat(1024));
        });
    });

    describe("default version", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("md-select[formControlName=defaultVersion]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has no validation", () => {
            const controlId = "defaultVersion";
            validateControl(applicationForm, controlId).passes(validators.required).with("");
            validateControl(applicationForm, controlId).passes(validators.required).with(null);
        });
    });

    describe("Package File", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("md-radio-group[formControlName=allowUpdates]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has required validation", () => {
            validateControl(applicationForm, "allowUpdates").passes(validators.required).with(false);
            validateControl(applicationForm, "allowUpdates").passes(validators.required).with(true);
            validateControl(applicationForm, "allowUpdates").fails(validators.required).with(null);
            validateControl(applicationForm, "allowUpdates").fails(validators.required).with("");
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
            expect(applicationForm.controls["displayName"].value).toBe("my monkey");
        });

        it("sets the default version", () => {
            expect(applicationForm.controls["defaultVersion"].value).toBe("1.0.1");
        });

        it("sets allow updates", () => {
            expect(applicationForm.controls["allowUpdates"].value).toBe(true);
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
            const form = debugElement.query(By.css("bl-action-form")).componentInstance as ActionFormComponent;
            form.performAction().subscribe(() => {
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

                expect(sidebarRefSpy.close).toHaveBeenCalledTimes(0);
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

            const form = debugElement.query(By.css("bl-action-form")).componentInstance as ActionFormComponent;
            form.performAction().subscribe({
                next: () => {
                    fail("call should have failed");
                    done();
                },
                error: (error: ServerError) => {
                    expect(error.statusText).toBe("error, error, error");
                    expect(error.toString()).toBe("400 - blast, we failed");

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
