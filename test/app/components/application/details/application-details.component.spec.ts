import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { ApplicationDetailsComponent } from "app/components/application/details";
import { Application, PackageState } from "app/models";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";
import { RxMockEntityProxy } from "test/utils/mocks";

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

    beforeEach(() => {
        entityProxy = new RxMockEntityProxy(Application, {
            cacheKey: "url",
            item: Fixtures.application.create({ id: enabledAppId, displayName: "bob" }),
        });

        applicationServiceSpy = {
            get: () => entityProxy,
        };

        activatedRouteSpy = {
            params: Observable.of({ id: enabledAppId }),
        };

        TestBed.configureTestingModule({
            imports: [AppModule],
            providers: [
                { provide: ApplicationService, useValue: applicationServiceSpy },
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
