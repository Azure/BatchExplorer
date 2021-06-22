import { initMockEnvironment } from "@batch/ui-common";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { PlaygroundExample } from "../playground-example";
import { runAxe } from "./runAxe";

/**
 * Test the example component to make sure the testing framework is working
 * properly. This file can also be used as a starting point for future
 * component tests.
 */
describe("Playground tests", () => {
    beforeEach(() => initMockEnvironment());

    test("Render the playground", () => {
        render(<PlaygroundExample text="Playground" />);
    });

    test("Render without accessibility violations", async () => {
        const { container } = render(<PlaygroundExample />);

        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("All playground tests", async () => {
        render(<PlaygroundExample text="Playground" />);

        //Testing number of navigation elements
        const navigation = screen.getAllByRole("navigation", {
            hidden: true,
        });

        expect(navigation.length).toBe(1);

        //Expect Button to be defined
        expect(screen.getByText("Button")).toBeDefined();

        //Expect 'Random' to not be defined
        expect(() => screen.getByText("Random")).toThrow(
            /Unable to find an element/
        );

        //Testing number of list elements
        const list = screen.getAllByRole("list");

        expect(list.length).toBe(4);

        //Testing list item elements
        const listItem = screen.getAllByRole("listitem");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[0]
                .getAttribute("title")
        ).toBe("Button");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[1]
                .getAttribute("title")
        ).toBe("Checkbox");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[2]
                .getAttribute("title")
        ).toBe("ComboBox");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[3]
                .getAttribute("title")
        ).toBe("SearchBox");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[4]
                .getAttribute("title")
        ).toBe("TextField");

        expect(
            listItem[0]
                .getElementsByClassName("ms-Button")[5]
                .getAttribute("title")
        ).toBe("Quota");

        expect(listItem.length).toBe(19);
    });
});
