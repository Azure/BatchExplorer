import { render, screen } from "@testing-library/react";
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

        const ddEl = screen.getByRole("combobox", { name: "Card" });
        expect(ddEl).toBeDefined();

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
