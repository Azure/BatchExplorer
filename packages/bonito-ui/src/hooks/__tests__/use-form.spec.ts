import { createForm } from "@azure/bonito-core";
import {
    NumberParameter,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { initMockEnvironment } from "@azure/bonito-core/lib/environment";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { initMockBrowserEnvironment } from "../../environment";
import { useForm } from "../use-form";

describe("useForm hook", () => {
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

        const onChangeSpy = jest.fn();
        const onValidateSpy = jest.fn();
        const onEvaluateSpy = jest.fn();

        const { result, waitForNextUpdate } = renderHook(() => {
            return useForm(form, {
                onFormChange: onChangeSpy,
                onValidate: onValidateSpy,
                onEvaluate: onEvaluateSpy,
            });
        });

        expect(onChangeSpy).toBeCalledTimes(0);
        expect(onValidateSpy).toBeCalledTimes(0);
        expect(onEvaluateSpy).toBeCalledTimes(0);
        expect(result.current.validationSnapshot).toBeUndefined();

        act(() => {
            form.updateValue("orderNumber", form.values.orderNumber + 1);
        });

        // Sync validation has happened
        expect(onValidateSpy).toBeCalledTimes(1);
        expect(result.current.validationSnapshot?.syncValidationComplete).toBe(
            true
        );
        expect(result.current.validationSnapshot?.asyncValidationComplete).toBe(
            false
        );

        await waitForNextUpdate();

        // Async validation has happened
        expect(onChangeSpy).toBeCalledTimes(1);
        expect(onValidateSpy).toBeCalledTimes(2);
        // No manual evaluation, so no onEvaluate call
        expect(onEvaluateSpy).toBeCalledTimes(0);

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
