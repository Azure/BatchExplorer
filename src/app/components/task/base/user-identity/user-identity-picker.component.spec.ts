import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { AutoUserScope, UserAccount, UserAccountElevationLevel, UserIdentityAttributes } from "app/models";
import { UserIdentityPickerComponent } from "./user-identity-picker.component";

const user1 = new UserAccount({
    name: "foo",
    elevationLevel: UserAccountElevationLevel.admin,
});

const user2 = new UserAccount({
    name: "bar",
    elevationLevel: UserAccountElevationLevel.nonadmin,
});

@Component({
    template: `
        <bl-user-identity-picker [userAccounts]="userAccounts" [formControl]="control"></bl-user-identity-picker>
    `,
})
class TestComponent {
    public control = new FormControl<UserIdentityAttributes | null>(null);
    public userAccounts: UserAccount[] = [user1, user2];
}

describe("UserIdentityComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let select: SelectComponent<UserIdentityAttributes>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SelectModule, ReactiveFormsModule, FormsModule, FormModule],
            declarations: [UserIdentityPickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-user-identity-picker"));
        fixture.detectChanges();

        select = de.query(By.directive(SelectComponent)).componentInstance;
    });

    it("sets all the options starting with the given user accounts", () => {
        const options = select.options.toArray();
        expect(options.length).toEqual(6); // 2 Provided + 4 auto users
        expect(options[0].label).toEqual("foo (Admin)");
        expect(options[0].value).toEqual({
            username: "foo",
        });
        expect(options[1].label).toEqual("bar");
        expect(options[1].value).toEqual({
            username: "bar",
        });

        expect(options[2].label).toEqual("Pool user");
        expect(options[2].value).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.nonadmin,
                scope: AutoUserScope.pool,
            },
        });
        expect(options[3].label).toEqual("Pool user (Admin)");
        expect(options[3].value).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.admin,
                scope: AutoUserScope.pool,
            },
        });
        expect(options[4].label).toEqual("Task user");
        expect(options[4].value).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.nonadmin,
                scope: AutoUserScope.task,
            },
        });
        expect(options[5].label).toEqual("Task user (Admin)");
        expect(options[5].value).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.admin,
                scope: AutoUserScope.task,
            },
        });
    });

    it("propagate the selection when choosing an option", () => {
        select.selectOption(select.options.toArray()[1]);
        expect(testComponent.control.value).toEqual({
            username: "bar",
        });
        select.selectOption(select.options.toArray()[3]);
        expect(testComponent.control.value).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.admin,
                scope: AutoUserScope.pool,
            },
        });
    });

    it("pass down the value when using custom user", () => {
        testComponent.control.setValue({
            username: "foo",
        });
        expect(select.selected.size).toEqual(1);
        expect([...select.selected].first()).toEqual({
            username: "foo",
        });
    });

    it("pass down the value when using auto user", () => {
        testComponent.control.setValue({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.nonadmin,
                scope: AutoUserScope.pool,
            },
        });
        expect(select.selected.size).toEqual(1);
        expect([...select.selected].first()).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.nonadmin,
                scope: AutoUserScope.pool,
            },
        });
    });

    it("revert to default when username not found", () => {
        testComponent.control.setValue({
            username: "invalid",
        });
        expect(select.selected.size).toEqual(1);
        expect([...select.selected].first()).toEqual({
            autoUser: {
                elevationLevel: UserAccountElevationLevel.nonadmin,
                scope: AutoUserScope.pool,
            },
        });
    });
});
