import * as React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { PropertyField } from "../property-field";
import { PropertyGroup } from "../property-group";
import { renderA11y } from "../../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../../environment";

describe("PropertyGroup component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render", async () => {
        const { axeResults } = await renderA11y(
            <PropertyGroup title="Car">
                <PropertyField label="Color" value="red" />
            </PropertyGroup>
        );
        expect(axeResults).toHaveNoViolations();

        // TODO: Ideally the icon wouldn't show in the text content of the heading
        expect(screen.getByRole("heading").textContent).toEqual("Car");
        expect(screen.getByTestId("label").textContent).toEqual("Color");
        expect(screen.getByTestId("content").textContent).toEqual("red");
    });

    test("Can expand/collapse group with click or enter/space", async () => {
        await render(
            <PropertyGroup title="Car">
                <PropertyField label="Color" value="red" />
            </PropertyGroup>
        );

        const heading = screen.getByRole("heading");
        const section = screen.getByTestId("property-group-section");

        expect(heading.tabIndex).toBe(0);
        expect(section.id).toBeDefined();
        expect(heading.getAttribute("aria-controls")).toBe(section.id);

        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();

        fireEvent.click(heading);
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");

        fireEvent.keyDown(heading, { key: "ArrowLeft" });
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");

        fireEvent.keyDown(heading, { key: "Enter" });
        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();

        fireEvent.keyDown(heading, { key: " " });
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");
    });
});
