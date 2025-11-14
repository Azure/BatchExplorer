import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { act } from "react";
import { CreateAccountAction } from "../create-account-action";
import { initMockBatchBrowserEnvironment } from "../../environment";
import { ActionForm } from "@azure/bonito-ui/lib/components/form";

describe("Create account action", () => {
    beforeEach(() => initMockBatchBrowserEnvironment());

    test("Minimal account", async () => {
        const action = new CreateAccountAction({
            accountName: "one", // This name is already in use
            subscriptionId: "1234",
            resourceGroupId: "testrg",
            location: "fakeregion",
        });
        await action.initialize();

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

        expect(action.isInitialized).toBe(false);

        render(<ActionForm action={action} />);

        // ActionForm handles initialization
        await act(() => action.waitForInitialization());
        expect(action.isInitialized).toBe(true);

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

        await user.click(accountNameInput);
        await user.keyboard("two");

        // Now the form control is dirty, the control's validation error will
        // be displayed
        waitFor(() => {
            expect(accountNameInput.getAttribute("aria-invalid")).toEqual(
                "true"
            );
        });
    });
});
