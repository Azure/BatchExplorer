import {
    PasswordParameter,
    StringParameter,
} from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createParam } from "../../../form";
import { runAxe } from "../../../test-util";
import { TextField } from "../text-field";

describe("TextField form control", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Simple text field", async () => {
        const { container } = render(
            <TextField
                param={createParam<string>(StringParameter, {
                    label: "Message",
                    placeholder: "What do you want to say?",
                })}
            ></TextField>
        );

        const input: HTMLInputElement = screen.getByRole("textbox");
        expect(input).toBeDefined();

        const user = userEvent.setup();
        await user.type(input, "Hello");
        expect(input.value).toBe("Hello");

        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("Password field", async () => {
        const { container } = render(
            <TextField
                type="password"
                param={createParam<string>(PasswordParameter, {
                    label: "Password",
                    placeholder: "What's the password?",
                })}
            ></TextField>
        );

        // Password boxes aren't treated as textboxes, but
        // don't (as of 9/2023) have their own ARIA role.
        // See: https://github.com/w3c/aria/issues/935
        const input: HTMLInputElement = screen.getByLabelText("Password");
        expect(input).toBeDefined();

        // Show password button
        const showButton: HTMLButtonElement = screen.getByRole("button");
        expect(showButton).toBeDefined();

        const user = userEvent.setup();
        await user.type(input, "password");
        expect(input.value).toBe("password");

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
