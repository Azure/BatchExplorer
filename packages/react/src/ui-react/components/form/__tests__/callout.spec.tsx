import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { Button } from "../../button";
import { Callout } from "../callout";

function Control() {
    const [isCalloutVisible, toggleIsCalloutVisible] = React.useState(false);

    return (
        <>
            <Button
                id={"button-id"}
                label="click"
                onClick={() => toggleIsCalloutVisible((oldState) => !oldState)}
            ></Button>
            <Callout
                heading="Callout"
                headingFontSize="xLarge"
                body="Text of the callout"
                bodyFontSize="medium"
                target={`#${"button-id"}`}
                isCalloutVisible={isCalloutVisible}
            ></Callout>
        </>
    );
}

describe("Callout control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render Callout Control", async () => {
        const { container } = render(<Control />);

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect button element to be present
        const button = screen.getByRole("button");
        expect(button).toBeDefined();

        //Since callout is invisible by default, callout should not be present if button is not clicked
        expect(screen.queryByText("Callout")).toBeNull();

        //Press the button
        fireEvent.click(screen.getByText(/click/i));

        //Callout should now be visible
        expect(screen.getByText("Callout")).toBeDefined();
    });
});
