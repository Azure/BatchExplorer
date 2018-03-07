import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { Response, ResponseOptions } from "@angular/http";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Permission } from "@batch-flask/ui/permission";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { BatchAccountCreateComponent } from "app/components/account/action/add";
import { AccountService, AuthorizationHttpService, SubscriptionService } from "app/services";
import * as TestConstants from "test/test-constants";
import { validateControl } from "test/utils/helpers";

import { ServerErrorMockComponent, complexFormMockComponents } from "test/utils/mocks/components";
// import { ResourceGroupMode } from "./batch-account-create.component";

describe("BatchAccountCreateComponent ", () => {
    let fixture: ComponentFixture<BatchAccountCreateComponent>;
    let component: BatchAccountCreateComponent;
    let debugElement: DebugElement;
    let accountServiceSpy: any;
    let authServiceSpy: any;
    let subscriptionServiceSpy: any;
    let notificationServiceSpy: any;

    const validators = TestConstants.validators;
    const serverErrorMsg = "Encounter a server error during request";

    beforeEach(() => {
        accountServiceSpy = {
            putResourcGroup: jasmine.createSpy("putResourcGroup").and.callFake((sub, rg, body) => {
                if (sub.subscriptionId === "mock-bad-subscription") {
                    const options = new ResponseOptions({
                        status: 400,
                        body: JSON.stringify({ error: { message: "invalid subscription" } }),
                    });
                    return Observable.throw(ServerError.fromARM(new Response(options)));
                }
                const options = new ResponseOptions({
                    status: [200, 201][Math.floor(Math.random() * 2)],
                    body: JSON.stringify({
                        id: `${sub.subscriptionId}/${rg}`,
                        name: rg,
                    }),
                });
                return Observable.of(ServerError.fromARM(new Response(options)));
            }),
            putBatchAccount: jasmine.createSpy("putBatchAccount").and.callFake((sub, rg, account, body) => {
                if (sub.subscriptionId === "mock-bad-subscription") {
                    const options = new ResponseOptions({
                        status: 400,
                        body: JSON.stringify({ error: { message: "invalid subscription" } }),
                    });
                    return Observable.throw(ServerError.fromARM(new Response(options)));
                }
                const options = new ResponseOptions({
                    status: [200, 201][Math.floor(Math.random() * 2)],
                    body: JSON.stringify({
                        id: `${sub.subscriptionId}/${rg}/${account}`,
                        location: body.location,
                    }),
                });
                return Observable.of(ServerError.fromARM(new Response(options)));
            }),
            nameAvailable: jasmine.createSpy("nameAvailable").and.callFake((name, sub, loc) => {
                if (name === "badname") {
                    return Observable.of({
                        nameAvailable: false,
                        message: `Account name '${name}' is in use`,
                    });
                } else if (name === "servererror") {
                    return Observable.throw({
                        status: 500,
                        message: serverErrorMsg,
                    });
                }
                return Observable.of(null);
            }),
            accountQuota: jasmine.createSpy("accountQuota").and.callFake((sub, loc) => {
                if (loc === "validquota") {
                    return Observable.of({
                        used: 10,
                        quota: 100,
                    });
                } else if (loc === "invalidquota") {
                    return Observable.of({
                        used: 10,
                        quota: 10,
                    });
                } else if (loc === "servererror") {
                    return Observable.throw({
                        status: 500,
                        message: serverErrorMsg,
                    });
                }
                return Observable.of(null);
            }),
        };

        authServiceSpy = {
            getPermission: jasmine.createSpy("getPermission").and.callFake((resourceId) => {
                if (resourceId === "dummy-1-rg-2") {
                    return Observable.of(Permission.Read);
                } else if (resourceId === "servererror") {
                    return Observable.throw({
                        status: 500,
                        message: serverErrorMsg,
                    });
                }
                return Observable.of(Permission.Write);
            }),
        };

        subscriptionServiceSpy = {
            subscriptions: Observable.of([
                { subscriptionId: "dummy-1", displayName: "sub-1" },
                { subscriptionId: "dummy-2", displayName: "sub-2" },
                { subscriptionId: "dummy-3", displayName: "sub-3" },
            ]),
            listResourceGroups: jasmine.createSpy("nameAvailable").and.callFake((sub) => {
                if (sub.subscriptionId === "dummy-1") {
                    return Observable.of([
                        { id: "dummy-1-rg-1", name: "dummy-1-rg-1", location: "eastus" },
                        { id: "dummy-1-rg-2", name: "dummy-1-rg-2", location: "westus" },
                    ]);
                } else if (sub.subscriptionId === "dummy-2") {
                    return Observable.of([
                        { id: "dummy-2-rg-1", location: "eastus" },
                        { id: "dummy-2-rg-2", location: "westus" },
                        { id: "dummy-2-rg-3", location: "westus" },
                    ]);
                }
                return Observable.of([]);
            }),
            listLocations: jasmine.createSpy("nameAvailable").and.callFake((sub) => {
                if (sub.subscriptionId === "dummy-1") {
                    return Observable.of([
                        { id: "dummy-1-loc-1", name: "eastus1", displayName: "East US", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-2", name: "eastus2", displayName: "East US 2", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-3", name: "eastus3", displayName: "East US 3", subscriptionId: "dummy-1" },
                        { id: "dummy-1-loc-4", name: "eastus4", displayName: "East US 4", subscriptionId: "dummy-1" },
                    ]);
                } else if (sub.subscriptionId === "dummy-2") {
                    return Observable.of([
                        { id: "dummy-2-loc-1", name: "westus1", displayName: "West US", subscriptionId: "dummy-2" },
                        { id: "dummy-2-loc-2", name: "westus2", displayName: "West US 2", subscriptionId: "dummy-2" },
                        { id: "dummy-2-loc-3", name: "westus3", displayName: "West US 3", subscriptionId: "dummy-2" },
                    ]);
                }
                return Observable.of([]);
            }),
        };

        notificationServiceSpy = {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error"),
        };

        TestBed.configureTestingModule({
            declarations: [...complexFormMockComponents, BatchAccountCreateComponent, ServerErrorMockComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: null },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: AuthorizationHttpService, useValue: authServiceSpy },
                { provide: SubscriptionService, useValue: subscriptionServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(BatchAccountCreateComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("should show title and description", () => {
        expect(debugElement.nativeElement.textContent).toContain("Create batch account");
    });

    describe("Batch account name", () => {
        it("should initialize name control", () => {
            const input = debugElement.query(By.css("input[formControlName=name]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("should have required validation for name control", () => {
            validateControl(component.form, "name").fails(validators.required).with("");
            validateControl(component.form, "name").passes(validators.required).with("bob");
        });

        it("should have maxLength/minLength validation for name control", () => {
            validateControl(component.form, "name").fails(validators.minlength).with("a".repeat(2));
            validateControl(component.form, "name").passes(validators.minlength).with("a".repeat(3));
            validateControl(component.form, "name").fails(validators.maxlength).with("a".repeat(65));
            validateControl(component.form, "name").passes(validators.maxlength).with("a".repeat(64));
        });

        it("should have pattern validation for name control", () => {
            validateControl(component.form, "name").fails(validators.pattern).with("INVALIDNAME");
            validateControl(component.form, "name").fails(validators.pattern).with("invalid-123");
            validateControl(component.form, "name").passes(validators.pattern).with("validname123");
        });

        it("should have nameAvailable validation for name control", fakeAsync(() => {
            const name = component.form.controls.name;
            validateControl(component.form, "name").fails("accountExists").with("badname");
            expect(name.getError("accountExists").message).toEqual(`Account name '${name.value}' is in use`);
            validateControl(component.form, "name").fails("serverError").with("servererror");
            expect(name.getError("serverError")).toEqual(serverErrorMsg);
        }));
    });

    describe("Subscription and resource group", () => {
        it("should initialized subscription list with subscriptions", () => {
            const select = debugElement.query(By.css("mat-select[formControlName=subscription]")).nativeElement;
            expect(select).toBeDefined();
            const options = select.querySelectorAll("mat-option");
            expect(options.length).toBe(3);
            // Everything below subscription should not be shown until subscription is picked
            const rgm = debugElement.query(By.css("mat-radio-group[formControlName=resourceGroupMode]"));
            const newRg = debugElement.query(By.css("input[formControlName=newResourceGroup]"));
            const rg = debugElement.query(By.css("mat-select[formControlName=resourceGroup]"));
            const loc = debugElement.query(By.css("mat-select[formControlName=location]"));
            expect(rgm).toBeNull();
            expect(newRg).toBeNull();
            expect(rg).toBeNull();
            expect(loc).toBeNull();
        });

        it("should have required validation", () => {
            validateControl(component.form, "subscription").fails(validators.required).with("");
            validateControl(component.form, "subscription").passes(validators.required).with("sub-1");
            validateControl(component.form, "resourceGroupMode").fails(validators.required).with(null);
            // validateControl(component.form, "resourceGroupMode").passes(validators.required)
            //     .with(ResourceGroupMode.CreateNew);
        });

        it("should intialize resource groups and locations after subscription is selected", fakeAsync(() => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-1", displayName: "sub-1" });
            fixture.detectChanges();
            const rgm = debugElement.query(By.css("mat-radio-group[formControlName=resourceGroupMode]"));
            const loc = debugElement.query(By.css("mat-select[formControlName=location]"));
            expect(rgm).not.toBeNull();
            expect(loc).not.toBeNull();
            // make sure location list is populated
            const locOptions = loc.nativeElement.querySelectorAll("mat-option");
            expect(locOptions.length).toBe(4);
        }));

        it("should have correct control displayed when switching between two resource group modes ", fakeAsync(() => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-1", displayName: "sub-1" });
            const resourceGroupMode = component.form.controls.resourceGroupMode;
            // resourceGroupMode.setValue(ResourceGroupMode.CreateNew);
            fixture.detectChanges();

            let rg = debugElement.query(By.css("mat-select[formControlName=resourceGroup]"));
            let newRg = debugElement.query(By.css("input[formControlName=newResourceGroup]"));
            expect(rg).toBeNull();
            expect(newRg).not.toBeNull();
            // resourceGroupMode.setValue(ResourceGroupMode.UseExisting);
            fixture.detectChanges();
            rg = debugElement.query(By.css("mat-select[formControlName=resourceGroup]"));
            newRg = debugElement.query(By.css("input[formControlName=newResourceGroup]"));
            expect(rg).not.toBeNull();
            expect(newRg).toBeNull();
            const rgOptions = rg.nativeElement.querySelectorAll("mat-option");
            expect(rgOptions.length).toBe(2);
        }));

        it("should show existed resource group validation for new resource group input", fakeAsync(() => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-1", displayName: "sub-1" });
            // component.form.controls.resourceGroupMode.setValue(ResourceGroupMode.CreateNew);
            fixture.detectChanges();
            validateControl(component.form, "newResourceGroup").fails("resourceGroupExists").with("dummy-1-rg-1");
        }));

        it("should show permission validation for resource group dropdown list", fakeAsync(() => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-2", displayName: "sub-2" });
            // component.form.controls.resourceGroupMode.setValue(ResourceGroupMode.UseExisting);
            fixture.detectChanges();
            validateControl(component.form, "resourceGroup").fails("noPermission").with({ id: "dummy-1-rg-2" });
            validateControl(component.form, "resourceGroup").fails("serverError").with({ id: "servererror" });
        }));
    });

    describe("location", () => {
        it("should initialize location after selected subscription", () => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-2", displayName: "sub-2" });
            fixture.detectChanges();
            let loc = debugElement.query(By.css("mat-select[formControlName=location]"));
            expect(loc).not.toBeNull();
            const locOptions = loc.nativeElement.querySelectorAll("mat-option");
            expect(locOptions.length).toBe(3);

            component.form.controls.subscription.setValue({ subscriptionId: "dummy-3", displayName: "sub-3" });
            fixture.detectChanges();
            loc = debugElement.query(By.css("mat-select[formControlName=location]"));
            expect(loc).toBeNull();
        });

        it("should have required and account quota validation", () => {
            component.form.controls.subscription.setValue({ subscriptionId: "dummy-2", displayName: "sub-2" });
            validateControl(component.form, "location").fails(validators.required).with(null);
            validateControl(component.form, "location").passes(validators.required).with({ name: "sub-1" });
            validateControl(component.form, "location").passes("quotaReached").with({ name: "validquota" });
            validateControl(component.form, "location").fails("quotaReached").with({ name: "invalidquota" });
            validateControl(component.form, "location").fails("serverError").with({ name: "servererror" });
        });
    });
});
