import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { RadioButton } from "../radio-button";

describe("Checkbox control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render radio buttons", async () => {
        const { container } = render(
            <>
                <RadioButton
                    id="radiobutton"
                    label="First checkbox"
                    disabled={false}
                    options={[
                        { key: "A", text: "Option A" },
                        { key: "B", text: "Option B" },
                        { key: "C", text: "Option C" },
                    ]}
                    selectedKey="A"
                ></RadioButton>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        const ddEl = screen.getByRole("radiogroup");
        expect(ddEl).toBeDefined();

        const item1 = ddEl
            .getElementsByClassName("ms-ChoiceField-input")[0]
            .getAttribute("id");
        expect(item1).toBe("ChoiceGroup0-A");

        const item2 = ddEl
            .getElementsByClassName("ms-ChoiceField-input")[2]
            .getAttribute("type");
        expect(item2).toBe("radio");
    });
});
