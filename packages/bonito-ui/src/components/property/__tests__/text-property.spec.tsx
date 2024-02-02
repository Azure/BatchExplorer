import * as React from "react";

import { TextProperty } from "../text-property";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { render, screen } from "@testing-library/react";

describe("TextProperty component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Single line", async () => {
        const { container } = render(
            <TextProperty label="Color" value="blue" />
        );
        expect(screen.getByTestId("text-property-span").textContent).toEqual(
            "blue"
        );
        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("Multiline", async () => {
        const { container } = render(
            <TextProperty
                label="Color"
                value="blue"
                multiline
                multilineMaxHeight={100}
            />
        );
        expect(screen.getByTestId("text-property-textfield")).toBeTruthy();
        expect(await runAxe(container)).toHaveNoViolations();
    });
});
