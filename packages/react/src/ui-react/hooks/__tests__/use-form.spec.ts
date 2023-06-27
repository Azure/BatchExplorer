import { createForm } from "@batch/ui-common";
import {
    NumberParameter,
    StringParameter,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { initMockEnvironment } from "@batch/ui-common/lib/environment";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { initMockBrowserEnvironment } from "../../environment";
import { useForm } from "../use-form";

describe("useFormParameter hook", () => {
    beforeEach(() => initMockEnvironment());

    beforeEach(() => initMockBrowserEnvironment());

    test("Form with data loading", async () => {
        const form = createForm<BeverageFormValues>({
            values: {
                orderNumber: 1,
            },
        });
        form.param("orderNumber", NumberParameter);
        form.param("temperature", StringParameter);
        form.param("beverageName", StringParameter, {
            onValidateSync: (value) => {
                if (value && !value.startsWith("iced")) {
                    throw new ValidationStatus(
                        "error",
                        "Only iced beverages are allowed"
                    );
                }
                return new ValidationStatus("ok");
            },
        });

        let changeCount = 0;
        let validateCount = 0;

        const { result, waitForNextUpdate } = renderHook(() => {
            return useForm(form, {
                onFormChange: () => {
                    changeCount++;
                },
                onValidate: () => {
                    validateCount++;
                },
            });
        });

        expect(changeCount).toBe(0);
        expect(validateCount).toBe(0);
        expect(result.current.validationSnapshot).toBeUndefined();

        act(() => {
            form.updateValue("orderNumber", form.values.orderNumber + 1);
        });

        // Sync validation has happened
        expect(validateCount).toBe(1);
        expect(result.current.validationSnapshot?.syncValidationComplete).toBe(
            true
        );
        expect(result.current.validationSnapshot?.asyncValidationComplete).toBe(
            false
        );

        await waitForNextUpdate();

        // Async validation has happened
        expect(changeCount).toBe(1);
        expect(validateCount).toBe(2);
        expect(result.current.validationSnapshot?.asyncValidationComplete).toBe(
            true
        );
        expect(result.current.validationSnapshot?.overallStatus?.level).toEqual(
            "ok"
        );
    });
});

type BeverageFormValues = {
    orderNumber: number;
    temperature?: string;
    beverageName?: string;
};
