import { initMockEnvironment } from "@batch/ui-common";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { runAxe } from "./runAxe";
import { ButtonDemo, testCount } from "../demo/generic/button/button-demo";

/**
 * Tests for the Button component of the playground
 */
describe("Button tests", () => {
    beforeEach(() => initMockEnvironment());

    test("Render the button component", () => {
        render(<ButtonDemo />);
    });

    test("Render button component without accessibility violations", async () => {
        const { container } = render(<ButtonDemo />);

        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("All button tests", async () => {
        render(<ButtonDemo />);

        //Testing number of radiogroup elements
        const radiogroup = screen.getAllByRole("radiogroup", {
            hidden: true,
        });

        expect(radiogroup.length).toBe(9);

        //Expect Button to be defined
        expect(screen.getByText("Button")).toBeDefined();

        //Expect 'Checkbox' to not be defined
        expect(() => screen.getByText("Checkbox")).toThrow(
            /Unable to find an element/
        );

        //Testing slider elements
        const slider = screen.getAllByRole("slider");

        expect(slider.length).toBe(21);

        //Testing radio elements
        const radio = screen.getAllByRole("radio");

        expect(radio.length).toBe(20);

        expect(
            radiogroup[0]
                .getElementsByClassName("ms-ChoiceField-input")[0]
                .getAttribute("name")
        ).toBe("NormalAlignStatus");
    });

    /*
     * Simulates a click of the first button on the ButtonDemo page
     * and checks whether that button was actually clicked
     */
    test("Simulate the click of a button", async () => {
        render(<ButtonDemo />);

        expect(testCount).toBe(0);

        fireEvent.click(screen.getAllByText(/button/i)[1]);
        fireEvent.click(screen.getAllByText(/button/i)[1]);

        expect(testCount).toBe(2);
    });
});
