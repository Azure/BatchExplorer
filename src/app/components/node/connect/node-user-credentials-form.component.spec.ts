import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SelectModule } from "@batch-flask/ui";
import { DialogService } from "@batch-flask/ui/dialogs";
import { DurationPickerComponent } from "@batch-flask/ui/duration-picker";
import { PermissionService } from "@batch-flask/ui/permission";
import { NodeUserCredentialsFormComponent } from "app/components/node/connect";
import { SSHKeyPickerComponent } from "app/components/node/connect/ssh-key-picker";
import { SSHKeyService } from "app/services";
import { Duration } from "luxon";
import { of } from "rxjs";
import { click, updateInput } from "test/utils/helpers";
import { SimpleFormMockComponent } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-node-user-credentials-form [isLinuxNode]="isLinuxNode" [submit]="submit">
        </bl-node-user-credentials-form>
    `,
})
class TestComponent {
    public isLinuxNode = false;

    public submit: jasmine.Spy;
}

describe("NodeUserCredentialsForm", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodeUserCredentialsFormComponent;
    let de: DebugElement;
    let sshKeyService;

    let usernameInput: DebugElement;
    let passwordInput: DebugElement;
    let sshKeyInput: DebugElement;
    let isAdminInput: DebugElement;

    beforeEach(() => {
        sshKeyService = {
            keys: of([]),
        };
        TestBed.configureTestingModule({
            imports: [
                FormsModule, ReactiveFormsModule, MaterialModule,
                NoopAnimationsModule, SelectModule, I18nTestingModule,
            ],
            declarations: [
                NodeUserCredentialsFormComponent, TestComponent, SimpleFormMockComponent,
                SSHKeyPickerComponent, DurationPickerComponent,
            ],
            providers: [
                { provide: SSHKeyService, useValue: sshKeyService },
                { provide: DialogService, useValue: {} },
                { provide: PermissionService, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-user-credentials-form"));
        component = de.componentInstance;
        testComponent.submit = jasmine.createSpy("submit");
        fixture.detectChanges();
    });

    describe("When windows node", () => {
        beforeEach(() => {
            component.isLinuxNode = false;
            fixture.detectChanges();

            usernameInput = de.query(By.css("input[formControlName=username]"));
            passwordInput = de.query(By.css("input[formControlName=password]"));
            sshKeyInput = de.query(By.css("bl-ssh-key-picker"));
            isAdminInput = de.query(By.css("mat-checkbox[formControlName=isAdmin]"));
        });

        it("Should show the username, password and isAdmin input", () => {
            expect(usernameInput).not.toBeFalsy();
            expect(passwordInput).not.toBeFalsy();
            expect(sshKeyInput).toBeFalsy();
            expect(isAdminInput).not.toBeFalsy();
        });

        it("Should have the right default values", () => {
            expect(usernameInput.nativeElement.value).toEqual("");
            expect(passwordInput.nativeElement.value).toEqual("");
            expect(isAdminInput.componentInstance.checked).toBe(true);
        });

        it("Update inputs should update the form", () => {
            updateInput(usernameInput, "myusername");
            updateInput(passwordInput, "mypassword123");
            click(isAdminInput.query(By.css("input")));

            fixture.detectChanges();

            expect(component.form.value).toEqual({
                mode: 0,
                sshPublicKey: "",
                username: "myusername",
                password: "mypassword123",
                isAdmin: false,
                expireIn: Duration.fromObject({ days: 1 }),
            });
        });

        it("should submit with the right values", () => {
            updateInput(usernameInput, "myusername");
            updateInput(passwordInput, "mypassword123");
            fixture.detectChanges();

            component.submitForm();

            expect(testComponent.submit).toHaveBeenCalledOnce();
            expect(testComponent.submit).toHaveBeenCalledWith({
                name: "myusername",
                password: "mypassword123",
                isAdmin: true,
                expiryTime: jasmine.anything(),
            });
        });
    });

    describe("When is unix node", () => {
        let sshKeyPicker: SSHKeyPickerComponent;

        beforeEach(() => {
            component.isLinuxNode = true;
            fixture.detectChanges();

            usernameInput = de.query(By.css("input[formControlName=username]"));
            passwordInput = de.query(By.css("input[formControlName=password]"));
            sshKeyInput = de.query(By.css("bl-ssh-key-picker"));
            isAdminInput = de.query(By.css("mat-checkbox[formControlName=isAdmin]"));

            expect(sshKeyInput).not.toBeFalsy();
            sshKeyPicker = sshKeyInput.componentInstance;
        });

        it("Should show the username, password and isAdmin input", () => {
            expect(usernameInput).not.toBeFalsy();
            expect(passwordInput).toBeFalsy();
            expect(isAdminInput).not.toBeFalsy();
        });

        it("Should have the right default values", () => {
            expect(usernameInput.nativeElement.value).toEqual("");
            expect(sshKeyPicker.sshKeyValue.value).toEqual("");
            expect(isAdminInput.componentInstance.checked).toBe(true);
        });

        it("Update inputs should update the form", async () => {
            updateInput(usernameInput, "myusername");
            sshKeyPicker.writeValue("my-ssh-key");
            click(isAdminInput.query(By.css("input")));
            fixture.detectChanges();

            expect(component.form.value).toEqual({
                mode: 1,
                username: "myusername",
                password: "",
                sshPublicKey: "my-ssh-key",
                isAdmin: false,
                expireIn: jasmine.anything(),
            });
        });

        it("should submit with the right values", () => {
            updateInput(usernameInput, "myusername");
            sshKeyPicker.writeValue("my-ssh-key");
            click(isAdminInput.query(By.css("input")));

            fixture.detectChanges();

            component.submitForm();

            expect(testComponent.submit).toHaveBeenCalledOnce();
            expect(testComponent.submit).toHaveBeenCalledWith({
                name: "myusername",
                sshPublicKey: "my-ssh-key",
                isAdmin: false,
                expiryTime: jasmine.anything(),
            });
        });
    });
});
