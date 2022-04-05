import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { runAxe } from "../../test-util/a11y";
import { initMockBrowserEnvironment } from "../../environment";
import { Button } from "../button";

describe("Button component", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Empty button", async () => {
        const { container } = render(<Button />);
        const buttonEl = screen.getByRole("button");
        expect(buttonEl.textContent).toEqual("");
        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("Button with onClick", async () => {
        let count = 1;
        const user = userEvent.setup();
        const { container } = render(
            <>
                <Button
                    primary={true}
                    label="Speak"
                    onClick={() => {
                        const el = document.querySelector(
                            "div[data-testid=button-test-message]"
                        );
                        if (el) {
                            el.textContent = `${count++}: Hello world`;
                        }
                    }}
                />
                <div data-testid="button-test-message"></div>
            </>
        );
        const buttonEl = screen.getByRole("button");
        const messageEl = screen.getByTestId("button-test-message");

        expect(buttonEl.textContent).toEqual("Speak");
        expect(messageEl.textContent).toEqual("");

        await user.click(buttonEl);
        expect(messageEl.textContent).toEqual("1: Hello world");
        await user.click(buttonEl);
        expect(messageEl.textContent).toEqual("2: Hello world");

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
