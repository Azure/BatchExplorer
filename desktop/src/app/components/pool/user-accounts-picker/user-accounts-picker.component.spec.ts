import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { BrowserModule, By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectModule } from "@batch-flask/ui";
import { UserAccountElevationLevel } from "app/models";
import { UserAccountDto } from "app/models/dtos";
import { click } from "test/utils/helpers";
import { UserAccountPickerComponent } from "./user-account-picker/user-account-picker.component";
import { UserAccountsPickerComponent } from "./user-accounts-picker.component";

@Component({
    template: `
        <bl-complex-form>
            <bl-form-page main-form-page>
                <bl-form-section>
                    <bl-user-accounts-picker [formControl]="userAccounts"></bl-user-accounts-picker>
                </bl-form-section>
            </bl-form-page>
        </bl-complex-form>
    `,
})
class TestComponent {
    public userAccounts = new FormControl<UserAccountDto[]>();
}

describe("UserAccountsPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: UserAccountsPickerComponent;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                FormModule,
                ReactiveFormsModule,
                FormsModule,
                I18nTestingModule,
                SelectModule,
                MatButtonToggleModule,
                MatCheckboxModule,
            ],
            declarations: [
                UserAccountsPickerComponent, UserAccountPickerComponent, TestComponent,
            ],
        });

        setup();
    });

    function setup() {
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css("bl-user-accounts-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    }

    function getButtons() {
        return de.queryAll(By.css(".form-picker"));
    }

    it("shows add a user accounts button", () => {
        const buttons = getButtons();
        expect(buttons.length).toEqual(1);
        expect(buttons[0].nativeElement.textContent).toContain("user-accounts-picker.addOne");
    });

    it("opens the edit form when clicking on add one", () => {
        let buttons = getButtons();
        click(buttons[0]);
        fixture.detectChanges();
        const certPicker = fixture.debugElement.query(By.css("bl-user-account-picker"));
        expect(certPicker).not.toBeFalsy();
        certPicker.componentInstance.form.patchValue({
            name: "foo",
            password: "pass123!",
            runElevated: true,
        });
        fixture.detectChanges();
        click(fixture.debugElement.query(By.css("bl-button.select")));
        fixture.detectChanges();

        buttons = getButtons();
        expect(buttons.length).toBe(2);
        // Trimed the thumbprint
        expect(buttons[0].nativeElement.textContent).toContain("foo");
        expect(buttons[0].nativeElement.textContent).toContain("Admin");
        expect(buttons[1].nativeElement.textContent).toContain("user-accounts-picker.addOne");
    });

    describe("when user acccount is preselected", () => {
        beforeEach(() => {
            testComponent.userAccounts.setValue([
                {
                    name: "foo",
                    password: "pass123!",
                    elevationLevel: UserAccountElevationLevel.admin,
                },
            ]);
            fixture.detectChanges();
        });

        it("shows selected references", () => {
            const buttons = getButtons();

            // Trimed the thumbprint buttons = getButtons();
            expect(buttons.length).toBe(2);
            // Trimed the thumbprint
            expect(buttons[0].nativeElement.textContent).toContain("foo");
            expect(buttons[0].nativeElement.textContent).toContain("Admin");
            expect(buttons[1].nativeElement.textContent).toContain("user-accounts-picker.addOne");
        });

        it("remove user acccount when clicking delete", () => {
            let buttons = getButtons();
            click(buttons[0].query(By.css(".clear-btn")));
            fixture.detectChanges();
            buttons = getButtons();
            expect(buttons.length).toBe(1);
            expect(buttons[0].nativeElement.textContent).toContain("user-accounts-picker.addOne");
        });
    });

    it("shows error when there is a duplicate username", async () => {
        component.userAccounts.markAsTouched();
        testComponent.userAccounts.setValue([
            new UserAccountDto({
                name: "foo",
                password: "pass123!",
                elevationLevel: UserAccountElevationLevel.admin,
            }),
            new UserAccountDto({
                name: "foo",
                password: "pass456!",
                elevationLevel: UserAccountElevationLevel.nonadmin,
            }),
        ]);
        fixture.detectChanges();
        await Promise.resolve();
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("user-accounts-picker.duplicate(username:foo)");
    });
});
