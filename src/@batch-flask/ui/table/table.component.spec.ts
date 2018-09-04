import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { MaterialModule } from "@batch-flask/core";
import { BreadcrumbService } from "@batch-flask/ui/breadcrumbs";
import { ContextMenuService } from "@batch-flask/ui/context-menu";
import {
    TableCellDefDirective,
    TableColumnComponent,
    TableComponent,
    TableConfig,
    TableHeadCellComponent,
    TableHeadCellDefDirective,
    TableHeadComponent,
} from "@batch-flask/ui/table";
import { TableRowRenderComponent } from "@batch-flask/ui/table/table-row-render";
import { VirtualScrollTestingModule } from "@batch-flask/ui/testing";
import { click, dblclick, mousedown } from "test/utils/helpers";

const sizeA = { id: "size_a", name: "Size A", numberOfCores: 1, resourceDiskSizeInMB: 1000 };
const sizeB = { id: "size_b", name: "Size B", numberOfCores: 8, resourceDiskSizeInMB: 2000 };
const sizeC = { id: "size_c", name: "Size C", numberOfCores: 4, resourceDiskSizeInMB: 80000 };
const sizeD = { id: "size_d", name: "Size D", numberOfCores: 2, resourceDiskSizeInMB: 4000 };

// tslint:disable:component-class-suffix
// tslint:disable:trackBy-function

class BaseTestComponent {
    public sizes: any[] = [];
    public picedSize: string;
    public tableConfig: TableConfig = {};
}
@Component({
    template: `
        <bl-table [data]="sizes" [(activeItem)]="pickedSize" [config]="tableConfig" style="width: 600px">
            <bl-column name="name">
                <div *blHeadCellDef>Name</div>
                <div *blCellDef="let size">{{size.name}}</div>
            </bl-column>
            <bl-column name="cores" [sortable]="true">
                <div *blHeadCellDef>Cores</div>
                <div *blCellDef="let size">{{size.numberOfCores}}</div>
            </bl-column>
            <bl-column name="resourceDiskSizeInMB" [sortable]="true">
                <div *blHeadCellDef>Disk</div>
                <div *blCellDef="let size">{{size.resourceDiskSizeInMB}}MB</div>
            </bl-column>
        </bl-table>
    `,
})
class TestComponent extends BaseTestComponent {
    public tableConfig = {
        sorting: {
            cores: (size) => size.numberOfCores,
        },
    };
}

describe("TableComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: BaseTestComponent;
    let de: DebugElement;

    function getRows(): HTMLElement[] {
        // Cannot use de.queryAll angular bug: https://github.com/angular/angular/issues/13066
        return de.nativeElement.querySelectorAll("bl-row-render");
    }

    function setup(component) {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, BrowserModule, MaterialModule, VirtualScrollTestingModule],
            declarations: [
                TableColumnComponent,
                TableComponent,
                TableHeadCellDefDirective,
                TableCellDefDirective,
                TableRowRenderComponent,
                TableHeadCellComponent,
                TableHeadComponent,
                component,
            ],
            providers: [
                { provide: ContextMenuService, useValue: null },
                { provide: BreadcrumbService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(component);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-table"));
        testComponent.sizes = [sizeA, sizeB, sizeC, sizeD];
        fixture.detectChanges();
    }

    describe("Sort", () => {
        let columns: DebugElement[];

        beforeEach(() => {
            setup(TestComponent);
            columns = de.queryAll(By.css("bl-table-head-cell"));
        });

        it("should not sort by any column by default", () => {
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size D");
        });

        it("should not sort when clicking on non sortable column", () => {
            click(columns[0]); // Click on the name column
            fixture.detectChanges();

            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size D");
        });

        it("should sort by number of cores (Using values mapping in config)", () => {
            click(columns[1]); // Click on the core size column
            fixture.detectChanges();

            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size D");
            expect(rows[2].textContent).toContain("Size C");
            expect(rows[3].textContent).toContain("Size B");
        });

        it("should sort by disk size", () => {
            click(columns[2]); // Click on the disk size column
            fixture.detectChanges();
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size A");
            expect(rows[1].textContent).toContain("Size B");
            expect(rows[2].textContent).toContain("Size D");
            expect(rows[3].textContent).toContain("Size C");
        });

        it("clicking twice on column should filter desc", () => {
            click(columns[1]); // Click on the core size column
            fixture.detectChanges();
            click(columns[1]); // Click again
            fixture.detectChanges();
            const rows = getRows();
            expect(rows.length).toBe(4);

            expect(rows[0].textContent).toContain("Size B");
            expect(rows[1].textContent).toContain("Size C");
            expect(rows[2].textContent).toContain("Size D");
            expect(rows[3].textContent).toContain("Size A");
        });
    });

    it("raise error if column doesn't have a name", () => {
        expect(() => setup(MissingColumnName)).toThrowError("bl-column must have a unique name but not was provided.");
    });

    it("raise error if column doesn't have a UNIQUE name", () => {
        expect(() => setup(DuplicateColumnName)).toThrowError("bl-column name 'cores' must be unique");
    });

    it("raise error if no cell definition", () => {
        expect(() => setup(MissingCellDefinition))
            .toThrowError(`bl-column 'name' must have a cell definition. `
                + `Add '<div *blCellDef="let item">item.value</div>'`);
    });

    describe("when showing checkboxes", () => {
        beforeEach(async () => {
            setup(TestComponent);
            testComponent.tableConfig = {
                showCheckbox: true,
            };
            fixture.detectChanges();
        });

        it("each row has one checkbox", () => {
            const rows = getRows();
            expect(rows.length).toBe(4, "Should have 4 rows");
            for (const [index, row] of rows.entries()) {
                const checkboxes = row.querySelectorAll(".checkbox-cell");
                expect(checkboxes.length).toBe(1, `Should show one checkbox on row ${index}`);
            }
        });

        it("click on checkbox toggle selection", () => {
            let rows = getRows();
            click(rows[1].querySelector(".checkbox-cell"));
            fixture.detectChanges();
            rows = getRows();
            expect(rows[1].className).toContain("selected", "2nd row should be selected now");
            expect(rows[2].className).not.toContain("selected", "Should not have selected another row");

            click(rows[2].querySelector(".checkbox-cell"));
            fixture.detectChanges();
            expect(rows[1].className).toContain("selected", "2nd row should still be selected");
            expect(rows[2].className).toContain("selected", "3rd row should now have been selected");

            click(rows[2].querySelector(".checkbox-cell"));
            fixture.detectChanges();
            expect(rows[1].className).toContain("selected", "2nd row should still be selected");
            expect(rows[2].className).not.toContain("selected", "Should have unselected 3rd row");

            click(rows[1].querySelector(".checkbox-cell"));
            fixture.detectChanges();
            expect(rows[1].className).not.toContain("selected", "Should have unselected 2nd row");
            expect(rows[2].className).not.toContain("selected", "3rd row should stil be unselected");
        });
    });

    describe("Resizing", () => {
        let initialWidths: StringMap<number>;
        let head: TableHeadComponent;
        function getCellsWidth(): StringMap<number> {
            const widths = {};
            const cells = de.queryAll(By.css("bl-thead bl-table-head-cell"));

            for (const cell of cells) {
                const width = cell.nativeElement.getBoundingClientRect().width;
                widths[cell.componentInstance.column.name] = width;
            }
            return widths;
        }

        beforeEach(async () => {
            setup(TestComponent);
            fixture.detectChanges();
            head = de.query(By.directive(TableHeadComponent)).componentInstance;
            initialWidths = getCellsWidth();
        });

        it("should have initial size", () => {
            expect(initialWidths["name"]).toEqual(201); // Padding for first item adds 5px
            expect(initialWidths["cores"]).toEqual(196);
            expect(initialWidths["resourceDiskSizeInMB"]).toEqual(201); // Padding for last item adds 5px
        });

        it("should have one separator between each columns", () => {
            const separators = de.queryAll(By.css("bl-thead .column-separator"));
            expect(separators.length).toBe(2); // 3 columns - 1
        });

        it("shouldn't update the size when moving the mouse around", () => {
            const event: MouseEvent = document.createEvent("MouseEvent");
            head.onMousemove(event);
            fixture.detectChanges();

            const widths = getCellsWidth();

            expect(widths["name"]).toEqual(initialWidths["name"]);
            expect(widths["cores"]).toEqual(initialWidths["cores"]);
            expect(widths["resourceDiskSizeInMB"]).toEqual(initialWidths["resourceDiskSizeInMB"]);
        });

        it("when clicking on a separator it should start resizing", () => {
            const separators = de.queryAll(By.css("bl-thead .column-separator .column-separator-hitbox"));
            mousedown(separators[0].nativeElement);
            const initial = separators[0].nativeElement.getBoundingClientRect().left;
            fixture.detectChanges();

            const event: MouseEvent = new MouseEvent("mousemove", {
                clientX: initial + 50,
            });
            head.onMousemove(event);
            fixture.detectChanges();

            let widths = getCellsWidth();
            expect(widths["name"]).toEqual(249);
            expect(widths["cores"]).toEqual(148);
            expect(widths["resourceDiskSizeInMB"]).toEqual(initialWidths["resourceDiskSizeInMB"]);
            head.stopResizing();

            // Reset the width with dbl click
            dblclick(separators[0]);
            fixture.detectChanges();
            widths = getCellsWidth();
            expect(widths["name"]).toEqual(initialWidths["name"], "Should have reset 'name' column to initial size");
            expect(widths["cores"]).toEqual(initialWidths["cores"], "Should have reset 'cores' column to initial size");
            expect(widths["resourceDiskSizeInMB"]).toEqual(initialWidths["resourceDiskSizeInMB"], "Should reset");
        });
    });
});

@Component({
    template: `
        <bl-table [data]="sizes">
            <bl-column>
                <div *blHeadCellDef>Name</div>
                <div *blCellDef="let size">{{size.name}}</div>
            </bl-column>
        </bl-table>
    `,
})
class MissingColumnName extends BaseTestComponent {
}

@Component({
    template: `
        <bl-table [data]="sizes">
            <bl-column name="cores">
                <div *blHeadCellDef>Cores</div>
                <div *blCellDef="let size">{{size.name}}</div>
            </bl-column>
            <bl-column name="cores">
                <div *blHeadCellDef>Display name</div>
                <div *blCellDef="let size">{{size.displayName}}</div>
            </bl-column>
        </bl-table>
    `,
})
class DuplicateColumnName extends BaseTestComponent {
}

@Component({
    template: `
        <bl-table [data]="sizes">
            <bl-column name="name">
                <div *blHeadCellDef>Name</div>
            </bl-column>
        </bl-table>
    `,
})
class MissingCellDefinition extends BaseTestComponent {
}
