import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PropertyField } from "../property-field";
import { PropertyGroup } from "../property-group";
import { runAxe } from "../../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../../environment";

describe("PropertyGroup component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render", async () => {
        const { container } = render(
            <PropertyGroup title="Car">
                <PropertyField label="Color" value="red" />
            </PropertyGroup>
        );
        // TODO: Ideally the icon wouldn't show in the text content of the heading
        expect(screen.getByRole("heading").textContent).toEqual("Car");
        expect(screen.getByTestId("label").textContent).toEqual("Color");
        expect(screen.getByTestId("content").textContent).toEqual("red");
        expect(await runAxe(container)).toHaveNoViolations();
    });
});
