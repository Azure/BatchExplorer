import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { act } from "react-dom/test-utils";
import { ActionForm } from "../../components/form/action-form";
import { initMockBrowserEnvironment } from "../../environment";
import { CreateAccountAction } from "../create-account-action";

describe("Create account action", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Minimal account", async () => {
        const action = new CreateAccountAction({
            accountName: "one", // This name is already in use
            subscriptionId: "1234",
            resourceGroupId: "testrg",
            location: "fakeregion",
        });

        const form = action.form;
        expect(form.values.accountName).toEqual("one");
        expect(form.values.subscriptionId).toEqual("1234");
        expect(form.values.resourceGroupId).toEqual("testrg");
        expect(form.values.location).toEqual("fakeregion");

        // Validation has not been performed.
        expect(form.validationStatus).toBeUndefined();

        await action.form.validate();

        // Account name is already in use
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.entryValidationStatus.accountName?.level).toEqual("error");
        expect(form.entryValidationStatus.accountName?.message).toEqual(
            "An account named one already exists"
        );

        // Fix the account name issue and rerun validation
        form.updateValue("accountName", "myaccount");

        await action.form.validate();

        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.entryValidationStatus.accountName?.level).toEqual("ok");
        expect(form.entryValidationStatus.accountName?.message).toBeUndefined();
    });

    test("Render account form", async () => {
        const user = userEvent.setup();
        const action = new CreateAccountAction({
            accountName: "one", // This name is already in use
            subscriptionId: "1234",
            resourceGroupId: "testrg",
            location: "fakeregion",
        });

        render(<ActionForm action={action} />);

        const accountNameInput: HTMLInputElement = await screen.findByLabelText(
            "Account name",
            {
                exact: false,
            }
        );
        expect(accountNameInput).toBeDefined();
        expect(accountNameInput.value).toEqual("one");
        expect(accountNameInput.getAttribute("aria-invalid")).toEqual("false");

        await act(async () => {
            await action.form.validate();
        });

        expect(action.form.validationStatus?.level).toEqual("error");

        // Validation error won't be displayed until user interaction
        expect(accountNameInput.getAttribute("aria-invalid")).toEqual("false");

        // No user interaction yet, so parameter hasn't been marked dirty
        expect(action.form.getParam("accountName").dirty).toBeUndefined();

        await user.click(accountNameInput);
        await user.keyboard("two");

        // Now the parameter is dirty, and the control's validation error will
        // be displayed
        expect(action.form.getParam("accountName").dirty).toBe(true);

        waitFor(() => {
            expect(accountNameInput.getAttribute("aria-invalid")).toEqual(
                "true"
            );
        });
    });
});
