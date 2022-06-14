import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { Checkbox } from "../checkbox";

let testCount = 0;

describe("Checkbox control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render checkbox control", async () => {
        const { container } = render(
            <>
                <Checkbox
                    label="First checkbox"
                    ariaLabel="Accessible checkbox label"
                    checked={false}
                    disabled={false}
                    onChange={defaultCheckboxClicked}
                ></Checkbox>

                <Checkbox
                    label="Second checkbox"
                    defaultChecked={true}
                    boxSide="end"
                ></Checkbox>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect 2 checkbox elements to be present
        const ddEl = screen.getAllByRole("checkbox");
        expect(ddEl.length).toBe(2);

        //Expect 'Button' to not be defined
        expect(() => screen.getByText("Button")).toThrow(
            /Unable to find an element/
        );

        //Expect checkbox's onChange method to work correctly
        expect(testCount).toBe(0);
        fireEvent.click(screen.getAllByText(/checkbox/i)[0]);
        expect(testCount).toBe(1);
    });

    test("Simulate the checking of a checkbox", async () => {
        render(<Checkbox aria-checked={false} />);
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(checkbox.getAttribute("aria-checked")).toEqual("true");
    });
});

function defaultCheckboxClicked(): void {
    testCount++;
}
