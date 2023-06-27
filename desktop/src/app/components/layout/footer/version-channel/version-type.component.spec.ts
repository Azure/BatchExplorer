import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { VersionService, VersionType } from "app/services";
import { VersionTypeComponent } from "./version-type.component";

@Component({
    template: `<bl-version-type></bl-version-type>`,
})
class TestComponent {
}

describe("VersionTypeComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let versionServiceSpy;

    function setup(versionType: VersionType) {
        versionServiceSpy = {
            versionType,
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [VersionTypeComponent, TestComponent],
            providers: [
                { provide: VersionService, useValue: versionServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-version-type"));
        fixture.detectChanges();
    }

    it("Shows nothing when in stable", () => {
        setup(VersionType.Stable);
        const buildTypes = de.queryAll(By.css(".build-type"));
        expect(buildTypes.length).toBe(0);
    });

    it("Shows warning when in insider build", () => {
        setup(VersionType.Insider);
        const buildTypes = de.queryAll(By.css(".build-type"));
        expect(buildTypes.length).toBe(1);
        expect(buildTypes[0].nativeElement.classList).toContain("insider-build");
        expect(buildTypes[0].nativeElement.textContent).toContain("Insider");
    });

    it("Shows danger when in testing build", () => {
        setup(VersionType.Testing);
        const buildTypes = de.queryAll(By.css(".build-type"));
        expect(buildTypes.length).toBe(1);
        expect(buildTypes[0].nativeElement.classList).toContain("test-build");
        expect(buildTypes[0].nativeElement.textContent).toContain("Test");
    });

    it("Shows info when in dev build", () => {
        setup(VersionType.Dev);
        const buildTypes = de.queryAll(By.css(".build-type"));
        expect(buildTypes.length).toBe(1);
        expect(buildTypes[0].nativeElement.classList).toContain("dev-build");
        expect(buildTypes[0].nativeElement.textContent).toContain("Dev");
    });
});
