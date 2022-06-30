import * as React from "react";
import { Action } from "@batch/ui-common/lib/action";
import { FormValues } from "@batch/ui-common/lib/form";
import { FormLayoutType } from "./form-layout";
import { FormContainer } from "./form-container";

export interface ActionFormProps<V extends FormValues> {
    action: Action<V>;
    layout?: FormLayoutType;
    onFormChange?: (newValues: V, oldValues: V) => void;
}

export const ActionForm = <V extends FormValues>(
    props: ActionFormProps<V>
): JSX.Element => {
    const { action, layout, onFormChange } = props;

    const handleFormChange: (newValues: V, oldValues: V) => void =
        React.useCallback(
            async (oldValues, newValues) => {
                if (onFormChange) {
                    onFormChange(oldValues, newValues);
                }
            },
            [onFormChange]
        );

    return (
        <FormContainer
            form={action.form}
            layout={layout}
            onFormChange={handleFormChange}
        />
    );
};
