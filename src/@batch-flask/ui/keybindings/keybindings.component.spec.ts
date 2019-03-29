import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { CommandRegistry, KeyBindingsService } from "@batch-flask/core";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { of } from "rxjs";
import { updateInput } from "test/utils/helpers";
import { FormModule } from "..";
import { TableTestingModule } from "../testing";
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
    binding: "ctrl+d",
    execute: () => null,
};

const keybindingsMap = new Map()
    .set("ctrl+f", [fooCmd])
    .set("ctrl+b", [barCmd, barAltCmd])
    .set("ctrl+o", [overrideCmd]);

describe("KeyBindingsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let keyBindingServiceSpy;
    let searchEl: DebugElement;

    beforeEach(() => {

        keyBindingServiceSpy = {
            keyBindings: of(keybindingsMap),
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
            ],
            declarations: [KeyBindingsComponent, TestComponent],
            providers: [
                { provide: KeyBindingsService, useValue: keyBindingServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-keybindings"));
        fixture.detectChanges();

        searchEl = de.query(By.css("input.search"));
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

        const row1Cells = getCells(rows[1]);
        expect(row1Cells[0].nativeElement.textContent).toContain("My bar command");
        expect(row1Cells[1].nativeElement.textContent).toContain("ctrl+b");
        expect(row1Cells[2].nativeElement.textContent).toContain("Default");
        expect(row1Cells[2].nativeElement.textContent).not.toContain("User");

        const row2Cells = getCells(rows[2]);
        expect(row2Cells[0].nativeElement.textContent).toContain("My other command");
        expect(row2Cells[1].nativeElement.textContent).toContain("ctrl+b");
        expect(row2Cells[2].nativeElement.textContent).toContain("Default");
        expect(row2Cells[2].nativeElement.textContent).not.toContain("User");

        const row3Cells = getCells(rows[3]);
        expect(row3Cells[0].nativeElement.textContent).toContain("My command override");
        expect(row3Cells[1].nativeElement.textContent).toContain("ctrl+o");
        expect(row3Cells[2].nativeElement.textContent).toContain("User");
        expect(row3Cells[2].nativeElement.textContent).not.toContain("Default");
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
        updateInput(searchEl, `"ctrl+o"`);
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
});
