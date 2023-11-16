import { StringParameter } from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createParam } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { TabSelector } from "../tab-selector";

describe("Tab selector control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render simple tab selector", async () => {
        const onChange = jest.fn();

        const { container } = render(
            <TabSelector
                param={createParam<string>(StringParameter, {
                    label: "Card",
                    placeholder: "Pick a card",
                })}
                options={[
                    {
                        label: "Ace",
                        value: "ace-of-spades",
                    },
                    {
                        label: "King",
                        value: "king-of-hearts",
                    },
                    {
                        label: "Queen",
                        value: "queen-of-diamonds",
                    },
                ]}
                onChange={onChange}
            ></TabSelector>
        );

        expect(onChange).toBeCalledTimes(0);

        const tabListEl = screen.getByRole("tablist");
        expect(tabListEl).toBeDefined();

        const tabs: HTMLButtonElement[] = screen.getAllByRole("tab");
        expect(tabs.length).toEqual(3);
        expect(tabs.map((tabs) => tabs.name)).toEqual(["Ace", "King", "Queen"]);

        const selectedTab: HTMLButtonElement = screen.getByRole("tab", {
            selected: true,
        });
        expect(selectedTab.name).toBe("Ace");
        expect(selectedTab.getAttribute("aria-selected")).toBe("true");

        const kingTab: HTMLButtonElement = screen.getByRole("tab", {
            name: "King",
        });
        expect(kingTab.name).toBe("King");
        expect(kingTab.getAttribute("aria-selected")).toBe("false");

        const user = userEvent.setup();
        await user.click(kingTab);

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.any(Element),
            }),
            "king-of-hearts"
        );
        expect(kingTab.getAttribute("aria-selected")).toBe("true");

        expect(
            await runAxe(container, {
                rules: {
                    // See: https://github.com/microsoft/fluentui/issues/27052
                    "aria-required-children": { enabled: false },
                },
            })
        ).toHaveNoViolations();
    });
});
