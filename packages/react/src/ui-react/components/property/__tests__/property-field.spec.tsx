import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PropertyField } from "../property-field";
import { initMockEnvironment, uniqueElementId } from "@batch/ui-common";
import { runAxe } from "../../../test-util/a11y";

describe("PropertyField component", () => {
    beforeEach(() => initMockEnvironment());

    test("Simple key/value pair", async () => {
        const { container } = render(
            <PropertyField label="Color" value="blue" />
        );
        expect(screen.getByTestId("label").textContent).toEqual("Color");
        expect(screen.getByTestId("content").textContent).toEqual("blue");
        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("No props", () => {
        render(<PropertyField />);
        expect(screen.getByTestId("label").textContent).toEqual("-");
        expect(screen.getByTestId("content").textContent).toEqual("-");
    });

    test("Custom render functions", async () => {
        const labelId = uniqueElementId("label");
        const { container } = render(
            <PropertyField
                label="Color"
                value="blue"
                renderLabel={(label) => (
                    <label id={labelId}>Label: {label}</label>
                )}
                renderValue={(value) => (
                    <span aria-labelledby={labelId}>Value: {value}</span>
                )}
            />
        );

        const labelEl = screen.getByTestId("label");
        expect(labelEl.firstChild?.nodeName).toEqual("LABEL");
        expect(labelEl.firstChild?.textContent).toEqual("Label: Color");

        const contentEl = screen.getByTestId("content");
        expect(contentEl.firstChild?.nodeName).toEqual("SPAN");
        expect(contentEl.firstChild?.textContent).toEqual("Value: blue");

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
