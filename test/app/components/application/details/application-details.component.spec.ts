import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { ApplicationModule } from "app/components/application/application.module";
import { ApplicationDetailsComponent } from "app/components/application/details";
import { Application, PackageState } from "app/models";
import { AccountService, ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { ActivatedRouteMock, RxMockEntityProxy } from "test/utils/mocks";

const enabledAppId: string = "app-1";

fdescribe("ApplicationDetailsComponent.breadcrumb()", () => {
    it("has correct breadcrumb name", () => {
        const breadcrumb = ApplicationDetailsComponent.breadcrumb({ id: "app1" }, { tab: "details" });
        expect(breadcrumb.name).toEqual("app1");
        expect(breadcrumb.label).toEqual("Application - details");
    });
});

fdescribe("ApplicationDetailsComponent", () => {
    let fixture: ComponentFixture<ApplicationDetailsComponent>;
    let component: ApplicationDetailsComponent;
    let entityProxy: RxMockEntityProxy<any, Application>;
    let applicationServiceSpy: any;
    let activatedRouteSpy: any;
    let accountServiceSpy: any;

    beforeEach(() => {
        entityProxy = new RxMockEntityProxy(Application, {
            item: Fixtures.application.create({ id: enabledAppId, displayName: "bob" }),
        });

        applicationServiceSpy = {
            get: () => entityProxy,
        };

        accountServiceSpy = {
            currentAccount: Observable.of({ id: "some-account" }),
        };

        activatedRouteSpy = new ActivatedRouteMock({
            params: Observable.of({ id: enabledAppId }),
        });

        TestBed.configureTestingModule({
            imports: [ApplicationModule, RouterTestingModule],
            providers: [
                { provide: ApplicationService, useValue: applicationServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        });

        fixture = TestBed.createComponent(ApplicationDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe("loads application based on initial parameter", () => {
        it("proxy params are set to correct id", () => {
            expect(entityProxy.params).toEqual({ id: "app-1" });
        });

        it("application was fetched", () => {
            console.log("component.application", component.application);
            expect(component.application).toBeDefined();
        });
    });
});
