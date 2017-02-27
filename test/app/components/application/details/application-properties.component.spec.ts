import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { ApplicationModule } from "app/components/application/application.module";
import { ApplicationPropertiesComponent } from "app/components/application/details";
import { ApplicationService } from "app/services";
import * as Fixtures from "test/fixture";

describe("ApplicationPropertiesComponent", () => {
    let fixture: ComponentFixture<ApplicationPropertiesComponent>;
    let component: ApplicationPropertiesComponent;
    let applicationServiceSpy: any;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ApplicationModule, RouterTestingModule],
            providers: [
                { provide: ApplicationService, useValue: applicationServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(ApplicationPropertiesComponent);
        component = fixture.componentInstance;
        component.application = Fixtures.application.create({
            id: "app-1",
            allowUpdates: true,
            displayName: "apples and pears",
            defaultVersion: "1.25",
        });

        fixture.detectChanges();
    });

    it("application and decorator are set", () => {
        expect(component.application).toBeDefined();
        expect(component.decorator).toBeDefined();
        expect(component.application.id).toEqual("app-1");
        expect(component.decorator.id).toEqual("app-1");
    });

    it("allow updates is displayed", () => {
        let property = fixture.debugElement.query(By.css("bl-bool-property[label='Allow updates']"));
        expect(property.nativeElement.textContent).toContain("Enabled");
    });

    it("display name is displayed", () => {
        let property = fixture.debugElement.query(By.css("bl-text-property[label='Display name']"));
        expect(property.nativeElement.textContent).toContain("apples and pears");
    });

    it("default version is displayed", () => {
        let property = fixture.debugElement.query(By.css("bl-text-property[label='Default version']"));
        expect(property.nativeElement.textContent).toContain("1.25");
    });
});
