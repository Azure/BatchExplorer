import { render, screen } from "@testing-library/react";
import * as React from "react";
import { runAxe } from "../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../environment";
import { DataGrid, useLoadMoreItems } from "../data-grid";
import { fromIso, translate } from "@azure/bonito-core";
import { renderHook } from "@testing-library/react-hooks";

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

    test("Shimmer lines", async () => {
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
                items={generateDataItems(3)}
            />
        );

        // 3 data rows + 3 shimmer lines
        expect(getOffsetAriaRowCount(gridEl)).toBe(6);
        expect(getNumOfShimmerLines(container)).toBe(3);

        rerender(
            <DataGrid
                columns={["data"]}
                hasMore={false}
                items={generateDataItems(3)}
            />
        );

        // 3 data rows
        expect(getOffsetAriaRowCount(gridEl)).toBe(3);
        expect(getNumOfShimmerLines(container)).toBe(0);

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });

    test("onLoadMore callback", async () => {
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

    test("Virtual scrolling", async () => {
        // DetailsList of FluentUI utilizes virtual scrolling when items is more
        // than 10

        // Max number of tries to wait for virtual scrolling to kick in
        const maxTry = 10;
        const onLoadMore = jest.fn();
        let numTry = 0;
        let expectedOnLoadMoreCount = 0;
        let items = generateDataItems(1);

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

        expect(getOffsetRowCount()).toBe(items.length);
        // aria-rowcount should iclude 3 lines of shimmering
        expect(getOffsetAriaRowCount(gridEl)).toBe(items.length + 3);

        // getOffsetRowCount() === items.length means virtual scrolling is not
        // working, retry until it works or maxTry is reached
        while (getOffsetRowCount() === items.length) {
            if (numTry++ > maxTry) {
                throw new Error("Virtual scrolling is not working");
            }
            // If there is at least one shimmer line, onLoadMore should be
            // triggered
            if (getNumOfShimmerLines(container) >= 1) {
                expectedOnLoadMoreCount++;
            }

            items = generateDataItems(items.length + 5);
            rerender(renderGrid());
        }
        expect(onLoadMore).toHaveBeenCalledTimes(expectedOnLoadMoreCount);

        // Virtual scrolling is working, the number of rows should be less than
        // the number of items, and all shimmer lines should not in view
        expect(getOffsetRowCount()).toBeLessThan(items.length);
        expect(getNumOfShimmerLines(container)).toBe(0);

        // aria-rowcount should iclude 3 lines of shimmering
        expect(getOffsetAriaRowCount(gridEl)).toBe(items.length + 3);

        expect(await runAxe(container, ignoredA11yRules)).toHaveNoViolations();
    });

    describe("useLoadMoreItems hooks", () => {
        test("Throttle onLoadMore", async () => {
            const loadFn = jest.fn(() =>
                Promise.resolve({ done: false, items: [1] })
            );
            const { result, waitForNextUpdate } = renderHook(() =>
                useLoadMoreItems(loadFn)
            );
            expect(result.current.hasMore).toBe(true);
            expect(result.current.items).toEqual([]);
            // trigger loadMoreCallback 3 times, but loadFn should only be
            // called once, because it is throttled to wait for the previous
            // call to finish
            for (let i = 0; i < 3; i++) {
                result.current.loadMoreCallback();
            }
            expect(loadFn).toHaveBeenCalledTimes(1);

            // wait for the previous call to finish and state to be updated
            await waitForNextUpdate();

            expect(result.current.hasMore).toBe(true);
            expect(result.current.items).toEqual([1]);

            // trigger loadMoreCallback again, loadFn should be called again
            result.current.loadMoreCallback();
            expect(loadFn).toHaveBeenCalledTimes(2);
        });

        test("Cancel pending load", async () => {
            const getNewLoadFn = (items: number[]) => {
                return jest.fn(() => {
                    return Promise.resolve({
                        done: true,
                        items: items,
                    });
                });
            };
            const loadFn1 = getNewLoadFn([1]);
            const { result, rerender, waitForNextUpdate } = renderHook(
                ({ loadFn }) => useLoadMoreItems(loadFn),
                {
                    initialProps: { loadFn: loadFn1 },
                }
            );

            // change loadFn to a new one, the previous loadFn should be
            // cancelled, which means it should not set items to [1]
            const loadFn2 = getNewLoadFn([2]);
            rerender({ loadFn: loadFn2 });

            await waitForNextUpdate();

            expect(result.current.hasMore).toBe(false);
            expect(result.current.items).toEqual([2]);

            expect(loadFn1).toHaveBeenCalledTimes(1);
            expect(loadFn2).toHaveBeenCalledTimes(1);
        });

        test("No items", async () => {
            const expectedNumOfCalls = 3;
            const getLoadFn = () => {
                let i = 0;
                return jest.fn(() => {
                    i += 1;
                    const shouldFinish = i >= expectedNumOfCalls;
                    return Promise.resolve({
                        done: shouldFinish,
                        items: shouldFinish ? [1] : [],
                    });
                });
            };
            const loadFn = getLoadFn();
            const { result, waitForNextUpdate } = renderHook(() =>
                useLoadMoreItems(loadFn)
            );

            await waitForNextUpdate();

            // loadFn should be called 3 times, previous 2 calls return no items
            // and done is false, should continue to call loadFn until done is
            // true
            expect(loadFn).toHaveBeenCalledTimes(expectedNumOfCalls);
            expect(result.current.hasMore).toBe(false);
            expect(result.current.items).toEqual([1]);
        });
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

/**
 * Helper to generate an array of data items
 * @param num The number of items to generate
 * @returns The array of data items
 */
function generateDataItems(num: number = 3): { data: number }[] {
    const arr = Array(num)
        .fill(0)
        .map((_, i) => ({ data: i }));
    return arr;
}
