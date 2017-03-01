import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { Subject } from "rxjs";

import { ApplicationModule } from "app/components/application/application.module";
import { ApplicationListComponent } from "app/components/application/browse";
import { Application } from "app/models";
import { ApplicationService } from "app/services";
import { FilterBuilder } from "app/utils/filter-builder";
import * as Fixtures from "test/fixture";
import { RxMockListProxy } from "test/utils/mocks";

describe("ApplicationListComponent", () => {
    let fixture: ComponentFixture<ApplicationListComponent>;
    let component: ApplicationListComponent;
    let listProxy: RxMockListProxy<any, Application>;
    let applicationServiceSpy: any;

    beforeEach(() => {
        listProxy = new RxMockListProxy(Application, {
            cacheKey: "id",
            items: [
                Fixtures.application.create({ id: "app-1" }),
                Fixtures.application.create({ id: "app-2" }),
                Fixtures.application.create({ id: "app-3" }),
            ],
        });

        applicationServiceSpy = {
            list: () => listProxy,
            onApplicationAdded: new Subject(),
        };

        TestBed.configureTestingModule({
            imports: [ApplicationModule, RouterTestingModule],
            providers: [
                { provide: ApplicationService, useValue: applicationServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(ApplicationListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should have 3 applications", () => {
        expect(component.applications.size).toEqual(3);
        expect(component.displayedApplications.size).toEqual(3);
    });

    describe("filters displayed applications", () => {
        it("listProxy doesnt filter", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("app-1"), FilterBuilder.none());
            expect(component.data.options).toEqual({});
            expect(listProxy.options).toEqual({});
        });

        it("applied filter does client filtering", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("app-1"), FilterBuilder.none());
            fixture.detectChanges();

            expect(listProxy.options).toEqual({});
            expect(component.displayedApplications.size).toEqual(1);
            expect(component.applications.size).toEqual(3);
        });

        it("no filter results shows no results message", () => {
            component.filter = FilterBuilder.and(FilterBuilder.prop("id").startswith("banana"), FilterBuilder.none());
            fixture.detectChanges();

            expect(component.displayedApplications.size).toEqual(0);

            let property = fixture.debugElement.query(By.css("bl-no-item"));
            expect(property.nativeElement.textContent).toContain("Current filter returned no applications");
        });
    });
});
