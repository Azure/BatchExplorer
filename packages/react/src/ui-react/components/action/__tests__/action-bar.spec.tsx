import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { ActionBar } from "../action-bar";

describe("ActionBar component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render with two items", async () => {
        const { container } = render(
            <ActionBar items={[{ text: "Item One" }, { text: "Item Two" }]} />
        );

        // KLUDGE: Command bar seems to incorrectly render as hidden
        //         when run from unit tests. This may the the same
        //         issue: https://github.com/microsoft/fluentui/issues/12654
        expect(
            screen.getAllByRole("menuitem", {
                hidden: true,
            }).length
        ).toBe(2);

        expect(screen.getByText("Item One")).toBeDefined();
        expect(screen.getByText("Item Two")).toBeDefined();

        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("Icons only", async () => {
        render(
            <ActionBar
                iconsOnly={true}
                items={[
                    { text: "Add", icon: "add" },
                    { text: "Edit", icon: "edit" },
                    { text: "Delete", icon: "delete" },
                ]}
            />
        );

        const menuItems = screen.getAllByRole("menuitem", {
            hidden: true,
        });

        expect(menuItems.length).toBe(3);

        expect(
            menuItems[0]
                .getElementsByClassName("ms-Icon")[0]
                .getAttribute("data-icon-name")
        ).toBe("add");

        expect(
            menuItems[1]
                .getElementsByClassName("ms-Icon")[0]
                .getAttribute("data-icon-name")
        ).toBe("edit");

        expect(
            menuItems[2]
                .getElementsByClassName("ms-Icon")[0]
                .getAttribute("data-icon-name")
        ).toBe("delete");

        // TODO: These tests don't work because the menu items are
        //       always rendered in the overflow, which negates the
        //       effect of iconOnly. This is likely related to the
        //       command bar rendering as hidden in tests.
        //
        // expect(() => screen.getByText("Add")).toThrow(
        //     /Unable to find an element/
        // );
        // expect(() => screen.getByText("Edit")).toThrow(
        //     /Unable to find an element/
        // );
        // expect(() => screen.getByText("Delete")).toThrow(
        //     /Unable to find an element/
        // );
    });
});
