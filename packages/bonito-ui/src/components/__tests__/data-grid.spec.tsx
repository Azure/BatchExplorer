import { render, screen } from "@testing-library/react";
import * as React from "react";
import { runAxe } from "../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../environment";
import { DataGrid } from "../data-grid/data-grid";
import { fromIso, translate } from "@azure/bonito-core";

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

        expect(getOffsetAriaRowCount(gridEl)).toBe(0);
        expect(getOffsetRowCount()).toBe(0);
        expect(screen.getAllByRole("columnheader").length).toBe(1);
        expect(
            screen.getByText(translate("bonito.ui.dataGrid.noResults"))
        ).not.toBeNull();
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

        const rows = screen.getAllByRole("row");
        expect(getOffsetAriaRowCount(gridEl)).toBe(2);
        expect(getOffsetRowCount()).toBe(2);

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

        const rows = screen.getAllByRole("row");
        // header + 3 data rows + footer
        expect(gridEl.getAttribute("aria-rowcount")).toBe("5");
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

    test("Should display the correct number of shimmer lines when loading", async () => {
        const { container, rerender } = render(
            <DataGrid columns={["data"]} hasMore={true} items={[]} />
        );
        const gridEl = screen.getByRole("grid");

        // 10 shimmer lines
        expect(getOffsetAriaRowCount(gridEl)).toBe(10);
        expect(getNumOfShimmerLines(container)).toBe(10);

        rerender(
            <DataGrid
                columns={["data"]}
                hasMore={true}
                items={addMoreItems([], 3)}
            />
        );

        // 3 data rows + 3 shimmer lines
        expect(getOffsetAriaRowCount(gridEl)).toBe(6);
        expect(getNumOfShimmerLines(container)).toBe(3);

        rerender(
            <DataGrid
                columns={["data"]}
                hasMore={false}
                items={addMoreItems([], 3)}
            />
        );

        // 3 data rows
        expect(getOffsetAriaRowCount(gridEl)).toBe(3);
        expect(getNumOfShimmerLines(container)).toBe(0);

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });

    test("Should trigger onLoadMore at the correct timing", async () => {
        const onLoadMore = jest.fn();
        const { container, rerender } = render(
            <DataGrid hasMore={true} items={[]} onLoadMore={onLoadMore} />
        );
        // initial loading, should not trigger onLoadMore
        expect(onLoadMore).not.toHaveBeenCalled();

        rerender(
            <DataGrid
                hasMore={true}
                items={[{ data: 1 }]}
                onLoadMore={onLoadMore}
            />
        );
        // already has items, should trigger onLoadMore
        expect(onLoadMore).toHaveBeenCalled();

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });

    test("Should implement virtual scrolling when there are more items", async () => {
        const maxTry = 10;
        const onLoadMore = jest.fn();
        let numTry = 0;
        let expectedOnLoadMoreCount = 0;
        let items = addMoreItems([]);

        // Render the grid in a scrollable container
        const renderGrid = () => (
            <DataGrid
                hasMore={true}
                columns={["data"]}
                items={items}
                onLoadMore={onLoadMore}
            />
        );

        const { container, rerender } = render(renderGrid());
        const gridEl = screen.getByRole("grid");

        // getOffsetRowCount() === items.length means virtual scrolling is not
        // working, retqry until it works or maxTry is reached
        while (getOffsetRowCount() === items.length) {
            console.log(
                "retrying virtual scrolling",
                numTry,
                getNumOfShimmerLines(container)
            );
            if (numTry++ > maxTry) {
                throw new Error("Virtual scrolling is not working");
            }
            // onLoadMore should be called once for each render, because the
            // the virtual scrolling is not working, meaning that the shimmer
            // lines should be in view and are rerendered, which triggers onLoadMore.
            if (getNumOfShimmerLines(container) === 3) {
                expectedOnLoadMoreCount++;
            }

            items = addMoreItems(items);
            rerender(renderGrid());
        }

        // Virtual scrolling is working, the number of rows should be less than
        // the number of items.
        expect(getOffsetRowCount()).toBeLessThan(items.length);
        // Includes 3 lines of shimmering
        expect(getOffsetAriaRowCount(gridEl)).toBe(items.length + 3);

        expect(onLoadMore).toHaveBeenCalledTimes(expectedOnLoadMoreCount);
        console.log(
            "final getNumOfShimmerLines",
            getNumOfShimmerLines(container)
        );
        expect(getNumOfShimmerLines(container)).toBe(0);

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

/**
 * Helper to get the shimmer lines in a data grid
 * @param container The container element
 * @returns The shimmer lines
 */
function getNumOfShimmerLines(container: HTMLElement): number {
    return container.querySelectorAll(".ms-Shimmer-container").length;
}

/**
 * Helper to get the value of aria-rowcount in a data grid, includes
 * shimmer lines and doens't take into account the header and footer
 * rows. The return number of rows is aria-rowcount - 2.
 * @param gridEl The data grid element
 * @returns The number of rows in the grid
 */
function getOffsetAriaRowCount(gridEl: HTMLElement): number {
    const rowCount = gridEl.getAttribute("aria-rowcount");
    if (!rowCount) {
        throw new Error("aria-rowcount attribute not found");
    }
    // DataGrid's aria-rowcount is two more than the actual number of rows,
    // one for the header and one for the footer.
    return parseInt(rowCount, 10) - 2;
}

/**
 * Helper to get the number of rows in a data grid, doens't take into
 * account the header row or the shimmer lines, the return number of
 * rows is the number of rows - 1.
 */
function getOffsetRowCount(): number {
    return screen.getAllByRole("row").length - 1;
}

function addMoreItems(
    items: { data: number }[] = [],
    num: number = 3
): { data: number }[] {
    const start = items.length;
    const newArray = Array(num)
        .fill(0)
        .map((_, i) => ({ data: i + start }));
    return [...items, ...newArray];
}
