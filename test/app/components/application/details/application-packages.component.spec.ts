import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ApplicationPackagesComponent } from "app/components/application/details";
import * as Fixtures from "test/fixture";
import { EntityDetailsListMockComponent } from "test/utils/mocks/components";

describe("ApplicationPackagesComponent", () => {
    let fixture: ComponentFixture<ApplicationPackagesComponent>;
    let component: ApplicationPackagesComponent;
    let applicationServiceSpy: any;

    beforeEach(() => {
        applicationServiceSpy = {
            get: jasmine.createSpy("get-once"),
        };

        TestBed.configureTestingModule({
            declarations: [ApplicationPackagesComponent, EntityDetailsListMockComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(ApplicationPackagesComponent);
        component = fixture.componentInstance;
        component.application = Fixtures.application.create({ id: "app-1", packages: [
            Fixtures.applicationPackage.create({ version: "1.0" }),
            Fixtures.applicationPackage.create({ version: "2.0" }),
        ]});

        fixture.detectChanges();
    });

    it("should show no item error", () => {
        expect(component.application).toBeDefined();
        expect(component.application.id).toBe("app-1");
    });

    describe("table context commands are displayed", () => {
        it("delete button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Delete selected\"]"));
            expect(container.nativeElement).toBeDefined();
        });

        it("edit button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Update package\"]"));
            expect(container.nativeElement).toBeDefined();
        });

        it("activate button displayed", () => {
            const container = fixture.debugElement.query(By.css("bl-button[title=\"Activate pending package\"]"));
            expect(container.nativeElement).toBeDefined();
        });
    });
});
