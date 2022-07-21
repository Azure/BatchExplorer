import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { Button } from "../../button";
import { Link } from "../link";
import { Stack } from "../stack";
import { TextField } from "../text-field";

describe("Stack control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Render Stack Control", async () => {
        const { container } = render(
            <>
                <Stack id="stack" childrenGap={15} horizontal={false}>
                    <Button id="1" label="First button" />
                    <TextField textFieldLabel="Enter something here" />
                    <Button id="2" label="Second button" />
                    <Link
                        id="hello"
                        text="Sample link"
                        href="https://www.microsoft.com/"
                    />
                </Stack>
            </>
        );

        expect(await runAxe(container)).toHaveNoViolations();

        //Expect 2 button elements to be present
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBe(2);

        //Expect link attribute to propagate correctly
        const link = screen.getByText("Sample link");
        expect(link.getAttribute("id")).toBe("hello");

        //Expect the stack to contain 4 children
        const stack = container.querySelector("#stack");
        expect(stack?.childElementCount).toBe(4);
    });
});
