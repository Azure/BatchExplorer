import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { CurrentBrowserWindow, OSService } from "@batch-flask/ui";
import { Platform } from "@batch-flask/utils";
import { BehaviorSubject } from "rxjs";
import { HeaderComponent } from "./header.component";

@Component({
    template: `<bl-header></bl-header>`,
})
class TestComponent {
}

class MockOSService {
    public platform = Platform.Windows;

    public isOSX() {
        return this.platform === Platform.OSX;
    }
}

describe("HeaderComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let osServiceSpy: MockOSService;
    let currentWindowSpy;

    function setup() {

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, TestComponent],
            providers: [
                { provide: OSService, useValue: osServiceSpy },
                { provide: CurrentBrowserWindow, useValue: currentWindowSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-header"));
        fixture.detectChanges();
    }

    beforeEach(() => {
        osServiceSpy = new MockOSService();
        currentWindowSpy = {
            fullScreen: new BehaviorSubject(false),
        };
    });

    afterEach(() => {
        currentWindowSpy.fullScreen.complete();
    });

    describe("when platform is Windows", () => {
        beforeEach(() => {
            osServiceSpy.platform = Platform.Windows;
            setup();
        });

        it("should not skip the osx buttons", () => {
            expect(de.classes["skip-osx-buttons"]).toBe(false);
        });
    });

    describe("when platform is OSX", () => {
        beforeEach(() => {
            osServiceSpy.platform = Platform.OSX;
            setup();
        });

        it("should skip the osx buttons if not fullScreen", () => {
            currentWindowSpy.fullScreen.next(false);
            fixture.detectChanges();
            expect(de.classes["skip-osx-buttons"]).toBe(true);
        });

        it("should not skip the osx buttons if in fullScreen", () => {
            currentWindowSpy.fullScreen.next(true);
            fixture.detectChanges();
            expect(de.classes["skip-osx-buttons"]).toBe(false);
        });
    });
});
