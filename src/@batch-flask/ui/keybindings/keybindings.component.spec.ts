import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { CommandRegistry, KeyBinding, KeyBindingsService } from "@batch-flask/core";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { Subject, of } from "rxjs";
import { click, keydown, keyup, updateInput } from "test/utils/helpers";
import { DialogService, FormModule } from "..";
import { ButtonsModule } from "../buttons";
import { TableTestingModule } from "../testing";
import { KeyBindingPickerDialogComponent } from "./keybinding-picker";
import { KeyBindingListenerDirective } from "./keybindings-listener.directive";
import { KeyBindingsComponent } from "./keybindings.component";

@Component({
    template: `<bl-keybindings></bl-keybindings>`,
})
class TestComponent {
}

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

const overrideCmd = {
    id: "override",
    description: "My command override",
    binding: "alt+d",
    execute: () => null,
};

const keybindingsMap = new Map()
    .set("ctrl+f", [fooCmd])
    .set("ctrl+b", [barCmd, barAltCmd])
    .set("alt+o", [overrideCmd]);

describe("KeyBindingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let keyBindingServiceSpy;
    let searchEl: DebugElement;
    let recordKeyBtn: DebugElement;
    let dialogServiceSpy;
    let ref;
    let closeSubject: Subject<KeyBinding | null>;

    beforeEach(() => {
        closeSubject = new Subject();
        ref = {
            componentInstance: {
                command: null,
            },
            afterClosed: () => closeSubject,
        };
        dialogServiceSpy = {
            open: jasmine.createSpy("dialog.open").and.returnValue(ref),
        };

        keyBindingServiceSpy = {
            keyBindings: of(keybindingsMap),
            updateKeyBinding: jasmine.createSpy("updateKeyBinding").and.returnValue(of(null)),
            resetKeyBinding: jasmine.createSpy("resetKeyBinding").and.returnValue(of(null)),
        };
        CommandRegistry.register(fooCmd);
        CommandRegistry.register(barCmd);
        CommandRegistry.register(barAltCmd);
        CommandRegistry.register(overrideCmd);

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                FormModule,
                TableTestingModule,
                ElectronTestingModule,
                RouterTestingModule,
                ButtonsModule,
            ],
            declarations: [KeyBindingsComponent, KeyBindingListenerDirective, TestComponent],
            providers: [
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: KeyBindingsService, useValue: keyBindingServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-keybindings"));
        fixture.detectChanges();

        searchEl = de.query(By.css("input.search"));
        recordKeyBtn = de.query(By.css("bl-clickable.keybinding-listener-btn"));
    });

    afterEach(() => {
        (CommandRegistry as any)._commands.clear();
    });

    function getRows() {
        return de.queryAll(By.css("bl-row-render"));
    }

    function getCells(row: DebugElement) {
        return row.queryAll(By.css(".bl-table-cell"));
    }

    it("shows all commands with their binding", () => {
        const rows = getRows();
        expect(rows.length).toBe(4);
        const row0Cells = getCells(rows[0]);
        expect(row0Cells[0].nativeElement.textContent).toContain("My foo command");
        expect(row0Cells[1].nativeElement.textContent).toContain("ctrl+f");
        expect(row0Cells[2].nativeElement.textContent).toContain("Default");
        expect(row0Cells[2].nativeElement.textContent).not.toContain("User");
        expect(row0Cells[2].query(By.css("bl-clickable .fa-undo"))).toBeFalsy();

        const row1Cells = getCells(rows[1]);
        expect(row1Cells[0].nativeElement.textContent).toContain("My bar command");
        expect(row1Cells[1].nativeElement.textContent).toContain("ctrl+b");
        expect(row1Cells[2].nativeElement.textContent).toContain("Default");
        expect(row1Cells[2].nativeElement.textContent).not.toContain("User");
        expect(row1Cells[2].query(By.css("bl-clickable .fa-undo"))).toBeFalsy();

        const row2Cells = getCells(rows[2]);
        expect(row2Cells[0].nativeElement.textContent).toContain("My other command");
        expect(row2Cells[1].nativeElement.textContent).toContain("ctrl+b");
        expect(row2Cells[2].nativeElement.textContent).toContain("Default");
        expect(row2Cells[2].nativeElement.textContent).not.toContain("User");
        expect(row2Cells[2].query(By.css("bl-clickable .fa-undo"))).toBeFalsy();

        const row3Cells = getCells(rows[3]);
        expect(row3Cells[0].nativeElement.textContent).toContain("My command override");
        expect(row3Cells[1].nativeElement.textContent).toContain("alt+o");
        expect(row3Cells[2].nativeElement.textContent).toContain("User");
        expect(row3Cells[2].nativeElement.textContent).not.toContain("Default");
        expect(row3Cells[2].query(By.css("bl-clickable .fa-undo"))).not.toBeFalsy();
    });

    it("filter the rows by description", () => {
        updateInput(searchEl, "foo");
        fixture.detectChanges();

        let rows = getRows();
        expect(rows.length).toBe(1);

        expect(getCells(rows[0])[0].nativeElement.textContent).toContain("My foo command");

        updateInput(searchEl, "bar");
        fixture.detectChanges();

        rows = getRows();
        expect(rows.length).toBe(1);
        expect(getCells(rows[0])[0].nativeElement.textContent).toContain("My bar command");
    });

    it("filter the rows by shortcut", () => {
        updateInput(searchEl, `"alt+o"`);
        fixture.detectChanges();

        let rows = getRows();
        expect(rows.length).toBe(1);

        expect(getCells(rows[0])[0].nativeElement.textContent).toContain("My command override");

        updateInput(searchEl, `"ctrl+b`);
        fixture.detectChanges();

        rows = getRows();
        expect(rows.length).toBe(2);
        expect(getCells(rows[0])[0].nativeElement.textContent).toContain("My bar command");
        expect(getCells(rows[1])[0].nativeElement.textContent).toContain("My other command");
    });

    it("reset the key binding when clicking on the reset button", () => {
        const rows = getRows();
        const sourceCell = getCells(rows[3])[2];
        const button = sourceCell.query(By.css("bl-clickable"));
        expect(button).not.toBeFalsy();

        click(button);

        expect(keyBindingServiceSpy.resetKeyBinding).toHaveBeenCalledOnce();
        expect(keyBindingServiceSpy.resetKeyBinding).toHaveBeenCalledWith("override");
    });

    describe("when clicking the record key button", () => {
        beforeEach(async () => {
            click(recordKeyBtn);
            fixture.detectChanges();
            await fixture.whenStable();
            searchEl = de.query(By.css("input.search"));
        });

        it("highlight the button", () => {
            expect(recordKeyBtn.nativeElement.classList).toContain("active");
        });

        it("focus the search box", () => {
            expect(document.activeElement).toEqual(searchEl.nativeElement);
        });

        it("update the search box with the key presseed", () => {
            keydown(searchEl, "ctrl");
            fixture.detectChanges();
            expect(searchEl.nativeElement.value).toEqual(`"ctrl"`);
            expect(getRows().length).toEqual(3);

            keydown(searchEl, "f");
            fixture.detectChanges();
            expect(searchEl.nativeElement.value).toEqual(`"ctrl+f"`);
            expect(getRows().length).toEqual(1);

            keyup(searchEl, "f");
            fixture.detectChanges();
            expect(searchEl.nativeElement.value).toEqual(`"ctrl+f"`);
            expect(getRows().length).toEqual(1);

            keydown(searchEl, "b");
            fixture.detectChanges();
            expect(searchEl.nativeElement.value).toEqual(`"ctrl+b"`);
            expect(getRows().length).toEqual(2);
        });
    });

    describe("when clicking on a row", () => {
        beforeEach(() => {
            const rows = getRows();
            click(rows[0]);
        });

        it("opens the key binding picker dialog when clicking on a row", () => {
            expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
            expect(dialogServiceSpy.open).toHaveBeenCalledWith(KeyBindingPickerDialogComponent);

            expect(ref.componentInstance.command).toEqual(fooCmd);
        });

        it("save the user binding if the picker returns something", () => {
            const binding = KeyBinding.parse("ctrl+k");
            closeSubject.next(binding);
            closeSubject.complete();
            expect(keyBindingServiceSpy.updateKeyBinding).toHaveBeenCalledOnce();
            expect(keyBindingServiceSpy.updateKeyBinding).toHaveBeenCalledWith("foo", binding);
        });

        it("doesn't do anything if the picker returns null", () => {
            expect(ref.componentInstance.command).toEqual(fooCmd);
            closeSubject.next(null);
            closeSubject.complete();
            expect(keyBindingServiceSpy.updateKeyBinding).not.toHaveBeenCalled();
        });
    });
});
