import { screen, render } from "@testing-library/react";
import * as React from "react";
import { act } from "react-dom/test-utils";
import { UpdateNodeCommsAction } from "../update-node-comms-action";
import { NodeCommunicationMode } from "@batch/ui-service";
import { initMockBatchBrowserEnvironment } from "../../environment";
import { ActionForm } from "@azure/bonito-ui/lib/components/form";
import { runAxe } from "@azure/bonito-ui/lib/test-util";

describe("Update node communication mode action", () => {
    beforeEach(() => initMockBatchBrowserEnvironment());

    test("Validate form", async () => {
        const action = new UpdateNodeCommsAction(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1"
        );
        await action.initialize();

        const form = action.form;
        expect(form.values.currentNodeCommunicationMode).toEqual("N/A");
        expect(form.values.targetNodeCommunicationMode).toEqual("Default");

        // Validation has not been performed.
        expect(form.validationStatus).toBeUndefined();

        // Initially valid
        await action.form.validate();
        expect(form.validationStatus?.level).toEqual("ok");

        // Invalid node comms mode value
        action.form.updateValue(
            "targetNodeCommunicationMode",
            "invalid" as NodeCommunicationMode
        );

        await action.form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual("Invalid value");

        // Set to back to undefined
        action.form.updateValue("targetNodeCommunicationMode", undefined);

        // Valid again
        await action.form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
    });

    test("Render form", async () => {
        // const user = userEvent.setup();
        const action = new UpdateNodeCommsAction(
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1"
        );

        expect(action.isInitialized).toBe(false);

        const { container } = render(<ActionForm action={action} />);

        await act(() => action.waitForInitialization());
        expect(action.isInitialized).toBe(true);

        const currentModeInput: HTMLInputElement = await screen.findByLabelText(
            "Current node communication mode",
            {
                exact: false,
            }
        );
        expect(currentModeInput).toBeDefined();
        expect(currentModeInput.value).toEqual("N/A");
        expect(currentModeInput.disabled).toEqual(true);

        const targetModeInput: HTMLInputElement = await screen.findByLabelText(
            "Target node communication mode",
            {
                exact: false,
            }
        );
        expect(targetModeInput).toBeDefined();
        expect(targetModeInput.textContent).toEqual("Default");

        await act(async () => {
            await action.form.validate();
        });

        expect(action.form.validationStatus?.level).toEqual("ok");

        expect(
            await runAxe(container, {
                rules: {
                    // See: https://github.com/microsoft/fluentui/issues/19090
                    "aria-required-children": { enabled: false },
                },
            })
        ).toHaveNoViolations();
    });
});
