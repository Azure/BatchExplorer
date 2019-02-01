import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { SelectModule } from "@batch-flask/ui/select";

import { ENTER, KeyCode } from "@batch-flask/core/keys";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { PermissionService } from "@batch-flask/ui";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { EditableTableColumnComponent, EditableTableComponent } from "@batch-flask/ui/form/editable-table";
import { click, createKeyboardEvent, updateInput } from "test/utils/helpers";
import { EditableTableSelectCellComponent } from "./select-cell";

@Component({
    template: `
        <bl-editable-table [formControl]="items">
            <bl-editable-table-column name="key">Key</bl-editable-table-column>
            <bl-editable-table-column name="value" default="default-value">Value</bl-editable-table-column>
        </bl-editable-table>
    `,
})
class TestComponent {
    public items = new FormControl([]);
}

describe("EditableTableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, SelectModule, ButtonsModule, I18nTestingModule],
            declarations: [
                EditableTableComponent, EditableTableColumnComponent, EditableTableSelectCellComponent, TestComponent,
            ],
            providers: [
                { provide: PermissionService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-editable-table"));
        fixture.detectChanges();
    });

    function expectRowValues(row: DebugElement, value1, value2) {
        const cells = row.queryAll(By.css("td"));
        expect(cells.length).toBe(3, "Row should have 3 cells");

        const input1 = cells[0].query(By.css("input"));
        const input2 = cells[1].query(By.css("input"));
        expect(input1).not.toBeFalsy();
        expect(input2).not.toBeFalsy();

        expect(input1.nativeElement.value).toBe(value1);
        expect(input2.nativeElement.value).toBe(value2);
    }

    function expectRowEmpty(row: DebugElement) {
        return expectRowValues(row, "", "default-value");
    }

    it("should show all the columns", () => {
        const columns = de.queryAll(By.css("thead th"));
        expect(columns.length).toBe(3, "Should have the number of column specified in the template plus 1");
        expect(columns[0].nativeElement.textContent).toContain("Key");
        expect(columns[1].nativeElement.textContent).toContain("Value");
        expect(columns[2].nativeElement.textContent).toBeBlank();
    });

    it("should start with an empty row", () => {
        const rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(1, "Should have 1 row");
        expectRowEmpty(rows[0]);
    });

    it("should add a new empty line when editing the last one", () => {
        const rows = de.queryAll(By.css("tbody tr"));
        const inputs = rows[0].queryAll(By.css("td input"));
        updateInput(inputs[0], "foo");
        fixture.detectChanges();

        const newRows = de.queryAll(By.css("tbody tr"));
        expect(newRows.length).toBe(2);
        expectRowValues(newRows[0], "foo", "default-value");
        expectRowEmpty(newRows[1]);

        expect(testComponent.items.value).toEqual([{ key: "foo", value: "default-value" }]);
    });

    it("should set rows from formControl", () => {
        testComponent.items.setValue([
            { key: "foo1", value: "bar1" },
            { key: "foo2", value: "bar2" },
            { key: "foo3", value: "bar3" },
        ]);
        fixture.detectChanges();
        const rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(4);
        expectRowValues(rows[0], "foo1", "bar1");
        expectRowValues(rows[1], "foo2", "bar2");
        expectRowValues(rows[2], "foo3", "bar3");
        expectRowEmpty(rows[3]);
    });

    it("should delete row", () => {
        testComponent.items.setValue([
            { key: "foo1", value: "bar1" },
            { key: "foo2", value: "bar2" },
            { key: "foo3", value: "bar3" },
        ]);
        fixture.detectChanges();
        const rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(4);
        const deleteBtn = rows[1].query(By.css(".delete-item-btn"));
        click(deleteBtn);
        fixture.detectChanges();

        const newRows = de.queryAll(By.css("tbody tr"));
        expect(newRows.length).toBe(3);
    });

    it("it should edit a exisiting row", () => {
        testComponent.items.setValue([
            { key: "foo1", value: "bar1" },
            { key: "foo2", value: "bar2" },
            { key: "foo3", value: "bar3" },
        ]);
        fixture.detectChanges();
        const rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(4);
        const row = rows[1];
        const inputs = row.queryAll(By.css("input"));
        expect(inputs.length).toBe(2, "Should have 2 inputs in each row");
        const input = inputs[0];
        updateInput(input, "newVal");
        expect(testComponent.items.value).toEqual([
            { key: "foo1", value: "bar1" },
            { key: "newVal", value: "bar2" },
            { key: "foo3", value: "bar3" },
        ]);
    });

    it("pressing enter shouldn't remove a row", () => {
        testComponent.items.setValue([
            { key: "foo1", value: "bar1" },
            { key: "foo2", value: "bar2" },
            { key: "foo3", value: "bar3" },
        ]);
        fixture.detectChanges();
        let rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(4);

        const row = rows[1];
        const inputs = row.queryAll(By.css("input"));
        const input = inputs[0].nativeElement;
        input.focus();

        const enterEvent = createKeyboardEvent("keypress", KeyCode.Enter, 13, input, ENTER);
        input.dispatchEvent(enterEvent);

        fixture.detectChanges();
        rows = de.queryAll(By.css("tbody tr"));
        expect(rows.length).toBe(4, "Should still have 4 rows");
    });
});
