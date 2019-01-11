import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TimeZoneService } from "@batch-flask/core";
import { I18nTestingModule, TestTimeZoneService, TimeZoneTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule, DropdownModule, I18nUIModule } from "@batch-flask/ui";
import { DateTime } from "luxon";
import { click, dblclick } from "test/utils/helpers";
import { TimezoneDropdownComponent } from "./timezone-dropdown.component";

@Component({
    template: `<bl-timezone-dropdown></bl-timezone-dropdown>`,
})
class TestComponent {
}

describe("TimezoneDropdownComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let timeZoneService: TestTimeZoneService;

    let dropDownButton: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DropdownModule, TimeZoneTestingModule, ButtonsModule, I18nTestingModule, I18nUIModule],
            declarations: [TimezoneDropdownComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-timezone-dropdown"));
        fixture.detectChanges();

        timeZoneService = TestBed.get(TimeZoneService);
        dropDownButton = de.query(By.css(".dropdown-btn-container"));

    });

    it("switch between utc and local when double clicking", () => {
        expect(timeZoneService.current.value.name).toEqual("utc");
        dblclick(dropDownButton);
        expect(timeZoneService.current.value.name).toEqual("local");
        dblclick(dropDownButton);
        expect(timeZoneService.current.value.name).toEqual("utc");
    });

    it("show the offset when using the local timezone", () => {
        timeZoneService.setTimezone("local");
        fixture.detectChanges();
        expect(dropDownButton.nativeElement.textContent).toContain(DateTime.local().offsetNameShort);
        expect(dropDownButton.nativeElement.textContent).not.toContain(DateTime.utc().offsetNameShort);
    });

    it("shows the options when clicking on button", () => {
        click(dropDownButton);
        fixture.detectChanges();

        const items = de.queryAll(By.css(".dropdown-item.timezone"));
        expect(items.length).toEqual(2);

        expect(items[0].nativeElement.textContent).toContain(`Local (${DateTime.local().offsetNameShort})`);
        expect(items[1].nativeElement.textContent).toContain("UTC");
    });

    it("select an option", () => {
        click(dropDownButton);
        fixture.detectChanges();

        const items = de.queryAll(By.css(".dropdown-item.timezone"));
        expect(items.length).toEqual(2);
        click(items[0]);
        fixture.detectChanges();
        expect(timeZoneService.current.value.name).toEqual("local");
        expect(dropDownButton.nativeElement.textContent).toContain(DateTime.local().offsetNameShort);
    });
});
