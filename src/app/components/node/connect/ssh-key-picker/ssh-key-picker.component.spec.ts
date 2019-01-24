import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { DialogService } from "@batch-flask/ui/dialogs";
import { SSHKeyPickerComponent } from "app/components/node/connect/ssh-key-picker";
import { SSHPublicKey } from "app/models";
import { SSHKeyService } from "app/services";
import { click } from "test/utils/helpers";

@Component({
    template: `<bl-ssh-key-picker [(ngModel)]="sshValue"></bl-ssh-key-picker>`,
})
class TestComponent {
    public sshValue: string;
}

describe("SSHKeyPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: SSHKeyPickerComponent;
    let de: DebugElement;
    let sshKeyServiceSpy;
    let dialogServiceSpy;

    beforeEach(() => {
        sshKeyServiceSpy = {
            keys: new BehaviorSubject<List<SSHPublicKey>>(List([])),
            saveKey: jasmine.createSpy("saveKey").and.returnValue(of()),
            deleteKey: jasmine.createSpy("deleteKey").and.returnValue(of()),
        };
        dialogServiceSpy = {prompt: jasmine.createSpy("dialog.prompt")};
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            declarations: [SSHKeyPickerComponent, TestComponent, ButtonComponent],
            providers: [
                { provide: SSHKeyService, useValue: sshKeyServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-ssh-key-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("it should show no key message when no saved keys", () => {
        expect(de.nativeElement.textContent).toContain("No saved public keys");
    });

    describe("when there is some saved keys", () => {
        beforeEach(() => {
            sshKeyServiceSpy.keys.next(List([
                new SSHPublicKey({ name: "Key 1", value: "some-key-1" }),
                new SSHPublicKey({ name: "Key 2", value: "some-key-2" }),
            ]));
            fixture.detectChanges();
        });

        it("it should NOT show no key message when no saved keys", () => {
            expect(de.nativeElement.textContent).not.toContain("No saved public keys");
        });

        it("it should show all key labels", () => {
            const keys = de.queryAll(By.css(".saved-key"));
            expect(keys.length).toBe(2);
            expect(keys[0].nativeElement.textContent).toContain("Key 1");
            expect(keys[1].nativeElement.textContent).toContain("Key 2");
        });

        it("click on the delete button should removed the saved key", () => {
            const keys = de.queryAll(By.css(".saved-key"));
            click(keys[0].query(By.css(".fa-times")));
            fixture.detectChanges();
            expect(sshKeyServiceSpy.deleteKey).toHaveBeenCalledOnce();
        });

        it("click on key should update the ssh value", () => {
            const keys = de.queryAll(By.css(".saved-key"));
            click(keys[0]);
            fixture.detectChanges();
            expect(component.sshKeyValue.value).toEqual("some-key-1");
        });
    });
});
