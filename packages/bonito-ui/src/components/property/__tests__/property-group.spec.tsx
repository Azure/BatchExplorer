import * as React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { PropertyField } from "../property-field";
import { PropertyGroup } from "../property-group";
import { renderA11y } from "../../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../../environment";
import userEvent from "@testing-library/user-event";
import { act } from "react";

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

        expect(screen.queryByTestId("collapse-icon")).toBeTruthy();
        expect(heading.tabIndex).toBe(0);
        expect(section.id).toBeDefined();
        expect(heading.getAttribute("aria-controls")).toBe(section.id);

        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();

        const user = userEvent.setup();
        await act(async () => user.click(heading));
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");

        await act(async () => user.keyboard("{arrowleft}"));
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");

        await act(async () => user.keyboard("{enter}"));
        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();

        await act(async () => user.keyboard(" "));
        expect(heading.getAttribute("aria-expanded")).toBe("false");
        expect(section.style.display).toBe("none");
    });

    test('Should not be able to expand/collapse if "disableCollapse" is true', async () => {
        await render(
            <PropertyGroup title="Car" disableCollapse={true}>
                <PropertyField label="Color" value="red" />
            </PropertyGroup>
        );

        expect(screen.queryByTestId("collapse-icon")).toBeNull();

        const heading = screen.getByRole("heading");
        const section = screen.getByTestId("property-group-section");

        expect(heading.tabIndex).toBe(0);
        expect(section.id).toBeDefined();
        expect(heading.getAttribute("aria-controls")).toBe(section.id);

        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();

        fireEvent.click(heading);
        expect(heading.getAttribute("aria-expanded")).toBe("true");
        expect(section.style.display).toBeFalsy();
    });
});
