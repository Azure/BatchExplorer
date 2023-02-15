import * as React from "react";
import { Action } from "@batch/ui-common/lib/action";
import { FormValues, ValidationSnapshot } from "@batch/ui-common/lib/form";
import { FormLayoutType } from "./form-layout";
import { FormContainer } from "./form-container";
import { getLogger } from "@batch/ui-common";
import { useAsyncEffect } from "../../hooks";

export interface ActionFormProps<V extends FormValues> {
    action: Action<V>;
    layout?: FormLayoutType;
    submitButtonLabel?: string;
    onActionInitialized?: () => void;
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
    onSubmit?: () => unknown;
}

export const ActionForm = <V extends FormValues>(
    props: ActionFormProps<V>
): JSX.Element => {
    const { action, layout, onFormChange, onValidate, onActionInitialized } =
        props;
    const [loading, setLoading] = React.useState<boolean>(true);
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    useAsyncEffect(async () => {
        // TODO: We should make a custom hook for this kind of data loading
        let isLatestInit = true;
        setLoading(true);
        await action.initialize();
        if (isLatestInit) {
            setLoading(false);
            if (onActionInitialized) {
                onActionInitialized();
            }
        }
        return () => {
            isLatestInit = false;
        };
    }, [action]);

    if (loading) {
        // TODO: Need a common loading component
        return <></>;
    }

    return (
        <FormContainer
            form={action.form}
            layout={layout}
            onFormChange={onFormChange}
            onValidate={onValidate}
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
