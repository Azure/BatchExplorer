import * as React from "react";
import { Action } from "@batch/ui-common/lib/action";
import { FormValues, ValidationSnapshot } from "@batch/ui-common/lib/form";
import { FormLayoutType } from "./form-layout";
import { FormContainer } from "./form-container";
import { getLogger } from "@batch/ui-common";

export interface ActionFormProps<V extends FormValues> {
    action: Action<V>;
    layout?: FormLayoutType;
    submitButtonLabel?: string;
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
    onSubmit?: () => unknown;
}

export const ActionForm = <V extends FormValues>(
    props: ActionFormProps<V>
): JSX.Element => {
    const { action, layout, onFormChange, onValidate } = props;

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const handleFormChange: (newValues: V, oldValues: V) => void =
        React.useCallback(
            async (oldValues, newValues) => {
                if (onFormChange) {
                    onFormChange(oldValues, newValues);
                }
            },
            [onFormChange]
        );

    const handleValidate: (snapshot?: ValidationSnapshot<V>) => void =
        React.useCallback(
            (snapshot) => {
                if (onValidate) {
                    onValidate(snapshot);
                }
            },
            [onValidate]
        );

    return (
        <FormContainer
            form={action.form}
            layout={layout}
            onFormChange={handleFormChange}
            onValidate={handleValidate}
            buttons={[
                {
                    label: props.submitButtonLabel ?? "Save",
                    primary: true,
                    submitForm: true,
                    disabled: submitting === true,
                    onClick: async () => {
                        setSubmitting(true);
                        try {
                            const { success, error } = await action.execute(
                                action.form.values
                            );

                            if (success) {
                                if (props.onSubmit) {
                                    props.onSubmit();
                                }
                            }

                            if (error) {
                                getLogger().error(
                                    "Error executing action: " +
                                        (error instanceof Error
                                            ? error.message
                                            : String(error))
                                );
                            }
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]}
        />
    );
};
