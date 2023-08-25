import { render, screen } from "@testing-library/react";
import * as React from "react";
import { runAxe } from "../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../environment";
import { DataGrid } from "../data-grid/data-grid";
import { fromIso } from "@azure/bonito-core";

const ignoredA11yRules = {
    rules: {
        // TODO: Re-enable this when DetailsList fixes this issue
        "aria-toggle-field-name": { enabled: false },
        // See https://github.com/microsoft/fluentui/issues/28706
        "aria-required-children": { enabled: false },
        // TODO: Figure out if this is a real issue. Started happening
        //       after upgrading to jest-axe 7.x. May be this issue:
        //       https://github.com/microsoft/fluentui/issues/18474
        "empty-table-header": { enabled: false },
    },
};

describe("DataGrid component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Empty grid", () => {
        render(<DataGrid />);
        const gridEl = screen.getByRole("grid");

        // One row: the column header
        expect(gridEl.getAttribute("aria-rowcount")).toBe("1");
        expect(screen.getAllByRole("row").length).toBe(1);
        expect(screen.getAllByRole("columnheader").length).toBe(1);
    });

    test("Simple grid", async () => {
        const cars = [
            { make: "Volkswagen", model: "Jetta" },
            {
                make: "Porsche",
                model: "911",
                madeOn: fromIso("2021-06-01T00:12:00Z"),
            },
        ];
        const { container } = render(
            <DataGrid items={cars} columns={["make", "model", "madeOn"]} />
        );
        const gridEl = screen.getByRole("grid");

        // Header plus 2 data rows, sorted alphabetically by the first column
        const rows = screen.getAllByRole("row");
        expect(gridEl.getAttribute("aria-rowcount")).toBe("3");
        expect(rows.length).toBe(3);

        const columnHeaders = screen.getAllByRole("columnheader");
        // One extra column header for the select checkbox column
        expect(columnHeaders.length).toBe(4);
        expect(getColumnHeaderText(columnHeaders[1])).toBe("make");
        expect(getColumnHeaderText(columnHeaders[2])).toBe("model");
        expect(getColumnHeaderText(columnHeaders[3])).toBe("madeOn");

        const firstRowCells = getRowDataCells(rows[1]);
        expect(firstRowCells.length).toBe(3);
        expect(firstRowCells[0].textContent).toBe("Volkswagen");
        expect(firstRowCells[1].textContent).toBe("Jetta");
        expect(firstRowCells[2].textContent).toBe("");

        const secondRowCells = getRowDataCells(rows[2]);
        expect(secondRowCells.length).toBe(3);
        expect(secondRowCells[0].textContent).toBe("Porsche");
        expect(secondRowCells[1].textContent).toBe("911");
        expect(secondRowCells[2].textContent).toBe(
            "2021-05-31T21:12:00.000-03:00"
        );

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });

    test("Custom grid columns", async () => {
        const cars = [
            { make: "Volkswagen", model: "Jetta" },
            {
                make: "Porsche",
                model: "911",
                color: "red",
                madeOn: fromIso("2021-06-01T00:12:00Z"),
            },
            { make: "Tesla", model: "Model S", color: "black" },
        ];
        const { container } = render(
            <DataGrid
                items={cars}
                columns={[
                    { prop: "make", label: "Manufacturer" },
                    { prop: "model", label: "Model" },
                    { prop: "color", label: "Color" },
                    { prop: "madeOn", label: "Manufacture Date" },
                ]}
            />
        );
        const gridEl = screen.getByRole("grid");

        // Header plus 3 data rows
        const rows = screen.getAllByRole("row");
        expect(gridEl.getAttribute("aria-rowcount")).toBe("4");
        expect(screen.getAllByRole("row").length).toBe(4);

        const columnHeaders = screen.getAllByRole("columnheader");
        // One extra column header for the select checkbox column
        expect(columnHeaders.length).toBe(5);
        expect(getColumnHeaderText(columnHeaders[1])).toBe("Manufacturer");
        expect(getColumnHeaderText(columnHeaders[2])).toBe("Model");
        expect(getColumnHeaderText(columnHeaders[3])).toBe("Color");
        expect(getColumnHeaderText(columnHeaders[4])).toBe("Manufacture Date");

        const firstRowCells = getRowDataCells(rows[1]);
        expect(firstRowCells.length).toBe(4);
        expect(firstRowCells[0].textContent).toBe("Volkswagen");
        expect(firstRowCells[1].textContent).toBe("Jetta");
        expect(firstRowCells[2].textContent).toBe("");
        expect(firstRowCells[3].textContent).toBe("");

        const secondRowCells = getRowDataCells(rows[2]);
        expect(secondRowCells.length).toBe(4);
        expect(secondRowCells[0].textContent).toBe("Porsche");
        expect(secondRowCells[1].textContent).toBe("911");
        expect(secondRowCells[2].textContent).toBe("red");
        expect(secondRowCells[3].textContent).toBe(
            "2021-05-31T21:12:00.000-03:00"
        );

        const thirdRowCells = getRowDataCells(rows[3]);
        expect(thirdRowCells.length).toBe(4);
        expect(thirdRowCells[0].textContent).toBe("Tesla");
        expect(thirdRowCells[1].textContent).toBe("Model S");
        expect(thirdRowCells[2].textContent).toBe("black");
        expect(thirdRowCells[3].textContent).toBe("");

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });
});

/**
 * Helper to get role="gridcell" elements which contain actual data (ie: not
 * including the checkbox cell, etc.)
 */
function getRowDataCells(gridRow: HTMLElement): NodeListOf<HTMLElement> {
    const fieldEl = gridRow.querySelectorAll(
        `[data-automationid="DetailsRowFields"]`
    );
    if (fieldEl.length !== 1) {
        throw new Error("Row does not contain any data fields");
    }
    return fieldEl[0].querySelectorAll(`[role="gridcell"]`);
}

/**
 * Given a data grid element of role="columnheader", get the text that is
 * displayed to the user
 */
function getColumnHeaderText(columnHeader: HTMLElement): string {
    const el: HTMLElement | null = columnHeader.querySelector(
        ".ms-DetailsHeader-cellName"
    );
    return el?.textContent ?? "";
}
