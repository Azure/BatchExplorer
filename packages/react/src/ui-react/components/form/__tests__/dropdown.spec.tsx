import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { Dropdown } from "../dropdown";

describe("Dropdown form control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render simple dropdown", async () => {
        const { container } = render(
            <Dropdown
                label="Card"
                options={[
                    { value: "ace" },
                    { value: "king" },
                    { value: "queen" },
                ]}
                placeholder="Pick a card"
            ></Dropdown>
        );

        const ddEl = screen.getByRole("combobox");
        expect(ddEl).toBeDefined();

        const user = userEvent.setup();
        user.click(ddEl);
        await waitFor(() =>
            expect(ddEl.getAttribute("aria-expanded")).toBe("true")
        );

        const options = screen.getAllByRole("option");
        expect(options.length).toEqual(3);
        expect(options.map((option) => option.textContent)).toEqual([
            "ace",
            "king",
            "queen",
        ]);

        expect(
            await runAxe(container, {
                rules: {
                    // See: https://github.com/microsoft/fluentui/issues/19090
                    "aria-required-children": { enabled: false },
                },
            })
        ).toHaveNoViolations();
    });
});
