import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { KeyBinding, KeyBindingsService } from "@batch-flask/core";
import { KeyCode } from "@batch-flask/core/keys";
import { FormModule } from "@batch-flask/ui";
import { BehaviorSubject, Subject } from "rxjs";
import { keydown, keyup } from "test/utils/helpers";
import { KeyBindingListenerDirective } from "../keybindings-listener.directive";
import { KeyBindingPickerDialogComponent } from "./keybinding-picker-dialog.component";

const fooCmd = {
    id: "foo",
    description: "My foo command",
    binding: "ctrl+f",
    execute: () => null,
};

const barCmd = {
    id: "bar",
    description: "My bar command",
    binding: "ctrl+b",
    when: (context) => context.has("barAllowed"),
    execute: () => null,
};

const barAltCmd = {
    id: "barAlt",
    description: "My other command",
    binding: "ctrl+b",
    when: (context) => !context.has("barAllowed"),
    execute: () => null,
};

const keybindingsMap = new Map()
    .set("ctrl+f", [fooCmd])
    .set("ctrl+b", [barCmd, barAltCmd]);

fdescribe("KeyBindingPickerDialogComponent", () => {
    let fixture: ComponentFixture<KeyBindingPickerDialogComponent>;
    let component: KeyBindingPickerDialogComponent;
    let keyBindingServiceSpy;
    let dialogRefSpy;
    let backdropClickSubject: Subject<any>;
    let de: DebugElement;
    let inputEl: DebugElement;

    beforeEach(() => {
        backdropClickSubject = new Subject();
        keyBindingServiceSpy = {
            keyBindings: new BehaviorSubject(new Map(keybindingsMap)),
        };

        dialogRefSpy = {
            close: jasmine.createSpy("close"),
            backdropClick: () => backdropClickSubject,
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, FormModule],
            declarations: [KeyBindingPickerDialogComponent, KeyBindingListenerDirective],
            providers: [
                { provide: KeyBindingsService, useValue: keyBindingServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        });
        fixture = TestBed.createComponent(KeyBindingPickerDialogComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        component.command = fooCmd;
        fixture.detectChanges();

        inputEl = de.query(By.css("input"));
    });

    it("update the input with the current keydown", () => {
        keydown(inputEl, "ctrl");
        keydown(inputEl, "k");
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("ctrl+k");
    });

    it("show a warning when using binding used by other commands", () => {
        keydown(inputEl, "ctrl");
        keydown(inputEl, "b");
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("ctrl+b");

        const duplicateEl = de.query(By.css(".found-duplicates"));
        expect(duplicateEl).not.toBeFalsy();

        const items = duplicateEl.queryAll(By.css("li"));
        expect(items.length).toBe(2);
        expect(items[0].nativeElement.textContent).toContain("My bar command");
        expect(items[1].nativeElement.textContent).toContain("My other command");
    });

    it("Does NOT show the duplicate binding warning if using same as the default for the command being edited", () => {
        keydown(inputEl, "ctrl");
        keydown(inputEl, "f");
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("ctrl+f");

        const duplicateEl = de.query(By.css(".found-duplicates"));
        expect(duplicateEl).toBeFalsy();
    });

    it("Close the dialog when clicking on backdrop", () => {
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
        backdropClickSubject.next();
        backdropClickSubject.complete();
        expect(dialogRefSpy.close).toHaveBeenCalledOnce();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
    });

    it("Close the dialog when pressing enter after entering bindings", () => {
        keydown(inputEl, "ctrl");
        keydown(inputEl, "k");
        keyup(inputEl, "ctrl");
        keyup(inputEl, "k");
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("ctrl+k");
        keydown(inputEl, "enter");

        expect(dialogRefSpy.close).toHaveBeenCalledOnce();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(KeyBinding.parse("ctrl+k"));
    });

    it("pressing enter then enter lets user pick enter as a keybinding", () => {
        keydown(inputEl, "enter");
        keyup(inputEl, "enter");
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("enter");
        keydown(inputEl, "enter");

        expect(dialogRefSpy.close).toHaveBeenCalledOnce();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(KeyBinding.parse("enter"));
    });

    it("pressing escape twice to close the dialog", () => {
        keydown(inputEl, "escape", KeyCode.Escape);
        keyup(inputEl, "escape", KeyCode.Escape);
        fixture.detectChanges();
        expect(inputEl.nativeElement.value).toEqual("escape");
        keydown(inputEl, "escape", KeyCode.Escape);

        expect(dialogRefSpy.close).toHaveBeenCalledOnce();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
    });
});
