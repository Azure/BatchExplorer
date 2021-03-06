import { initMockEnvironment } from "@batch/ui-common";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { ActionBar } from "../action-bar";

describe("ActionBar component", () => {
    beforeEach(() => initMockEnvironment());

    test("Render with two items", () => {
        render(
            <ActionBar items={[{ text: "Item One" }, { text: "Item Two" }]} />
        );

        expect(
            screen.getAllByRole("menuitem", {
                hidden: true,
            }).length
        ).toBe(2);

        expect(screen.getByText("Item One")).toBeDefined();
        expect(screen.getByText("Item Two")).toBeDefined();
    });
});
