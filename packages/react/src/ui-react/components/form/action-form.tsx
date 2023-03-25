import * as React from "react";
import { Action } from "@batch/ui-common/lib/action";
import { FormValues, ValidationSnapshot } from "@batch/ui-common/lib/form";
import { FormLayoutType } from "./form-layout";
import { FormButton, FormContainer } from "./form-container";
import { translate } from "@batch/ui-common";
import { useLogger } from "../../hooks/use-logger";

export interface ActionFormProps<V extends FormValues> {
    action: Action<V>;
    layout?: FormLayoutType;
    hideResetButton?: boolean;
    hideSubmitButton?: boolean;
    resetButtonLabel?: string;
    submitButtonLabel?: string;
    buttons?: FormButton[];
    onActionInitialized?: () => void;
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
    onSuccess?: () => unknown;
    onFailure?: (error: unknown) => unknown;
}

export const ActionForm = <V extends FormValues>(
    props: ActionFormProps<V>
): JSX.Element => {
    const {
        action,
        layout,
        onFormChange,
        onValidate,
        onActionInitialized,
        buttons,
        hideSubmitButton,
        hideResetButton,
    } = props;

    const logger = useLogger("ActionForm");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);

        action.initialize().then(() => {
            if (isMounted) {
                setLoading(false);
                if (onActionInitialized) {
                    onActionInitialized();
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, [onActionInitialized, action]);

    if (!action.isInitialized || loading) {
        // TODO: Need a common loading component
        return <></>;
    }

    let allButtons: FormButton[] = [];
    if (hideSubmitButton !== true) {
        // Default submit button
        allButtons.push({
            label: props.submitButtonLabel ?? translate("form.buttons.apply"),
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
                        if (props.onSuccess) {
                            props.onSuccess();
                        }
                    }

                    if (error) {
                        if (props.onFailure) {
                            props.onFailure(error);
                        } else {
                            logger.error(
                                "Error executing action: " +
                                    (error instanceof Error
                                        ? error.message
                                        : String(error))
                            );
                        }
                    }
                } finally {
                    setSubmitting(false);
                }
            },
        });
    }
    if (hideResetButton !== true) {
        // Default reset (discard) button
        allButtons.push({
            label:
                props.submitButtonLabel ??
                translate("form.buttons.discardChanges"),
            disabled: submitting === true,
            onClick: () => {
                action.form.reset();
            },
        });
    }
    if (buttons) {
        allButtons = allButtons.concat(buttons);
    }

    return (
        <FormContainer
            form={action.form}
            layout={layout}
            onFormChange={onFormChange}
            onValidate={onValidate}
            buttons={allButtons}
        />
    );
};
