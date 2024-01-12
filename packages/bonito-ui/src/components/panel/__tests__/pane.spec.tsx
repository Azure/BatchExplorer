import { render } from "@testing-library/react";
import { Panel } from "../panel";
import React from "react";
import userEvent from "@testing-library/user-event";

describe("PaneFooter", () => {
    it("should render header text if isOpen", () => {
        const { getByText } = render(
            <Panel isOpen={true} headerText="Test header text"></Panel>
        );
        getByText("Test header text");
    });

    it("should not render header text if not isOpen", () => {
        const { getByText } = render(
            <Panel isOpen={false} headerText="Test header text"></Panel>
        );
        expect(() => getByText("Test header text")).toThrow();
    });

    it("should render children", () => {
        const { getByText } = render(
            <Panel isOpen={true}>
                <div>Test children</div>
            </Panel>
        );
        getByText("Test children");
    });

    it("should render footer buttons", async () => {
        const spy = jest.fn();
        const { getByText } = render(
            <Panel
                isOpen={true}
                footerButtons={[
                    {
                        label: "Test button",
                        onClick: spy,
                    },
                ]}
            ></Panel>
        );
        const btn = getByText("Test button");
        await userEvent.click(btn);
        expect(spy).toHaveBeenCalled();
    });
});
