import { StringParameter } from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createParam } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { Dropdown } from "../dropdown";

describe("Dropdown form control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render simple dropdown", async () => {
        const { container } = render(
            <Dropdown
                param={createParam<string>(StringParameter, {
                    label: "Card",
                    placeholder: "Pick a card",
                })}
                options={[
                    { value: "ace" },
                    { value: "king" },
                    { value: "queen" },
                ]}
            ></Dropdown>
        );

        const ddEl = screen.getByRole("combobox");
        expect(ddEl).toBeDefined();

        const user = userEvent.setup();
        await user.click(ddEl);
        expect(ddEl.getAttribute("aria-expanded")).toBe("true");

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
