import * as React from "react";
import { Action } from "@azure/bonito-core/lib/action";
import { FormValues, ValidationSnapshot } from "@azure/bonito-core/lib/form";
import { FormLayoutType } from "./form-layout";
import { FormButton, FormContainer } from "./form-container";
import { translate } from "@azure/bonito-core";

export interface ActionFormProps<V extends FormValues> {
    /**
     * The action associated with the form
     */
    action?: Action<V>;

    /**
     * Controls how the form is rendered. The exact implementation depends on
     * the configured environment.
     */
    layout?: FormLayoutType;

    /**
     * If true, don't show the default reset button
     */
    hideResetButton?: boolean;

    /**
     * If true, don't show the default submit button
     */
    hideSubmitButton?: boolean;

    /**
     * The visible label of the form's reset button
     */
    resetButtonLabel?: string;

    /**
     * The visible label of the form's submit button
     */
    submitButtonLabel?: string;

    /**
     * Additional form buttons to add (beside the defaults)
     */
    buttons?: FormButton[];

    /**
     * Callback which is run after successful initialization
     */
    onActionInitialized?: () => void;

    /**
     * Callback which is run when there is an unhandled error (either during
     * initialization or action execution)
     *
     * @param error The object which was thrown (generally an error object)
     */
    onError?: (error: unknown) => void;

    /**
     * Callback which is run after successful action execution
     */
    onExecuteSucceeded?: () => void;

    /**
     * Callback which is run when action execution fails
     *
     * @param error The object which was thrown (generally an error object)
     */
    onExecuteFailed?: (error: unknown) => void;

    /**
     * Callback which is run on any form value change
     *
     * @param newValues The current values
     * @param oldValues The previous values
     */
    onFormChange?: (newValues: V, oldValues: V) => void;

    /**
     * Callback which is run whenever the action's form is validated
     *
     * @param snapshot Validation information, including the values of the
     *                 form as they were when validate() was called.
     */
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
}

export const ActionForm = <V extends FormValues>(
    props: ActionFormProps<V>
): JSX.Element => {
    const {
        action,
        layout,
        onFormChange,
        onActionInitialized,
        onError,
        onExecuteFailed,
        onExecuteSucceeded,
        onValidate,
        buttons,
        hideSubmitButton,
        hideResetButton,
        submitButtonLabel,
    } = props;

    const [loading, setLoading] = React.useState<boolean>(true);
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    // Store the last typed values to re-populate fields after failure
    const [lastTypedValues, setLastTypedValues] = React.useState<
        V | undefined
    >();

    React.useEffect(() => {
        let isMounted = true;
        setLoading(true);

        if (action) {
            action
                .initialize()
                .then(() => {
                    // Fulfilled
                    if (isMounted) {
                        setLoading(false);
                        if (onActionInitialized) {
                            onActionInitialized();
                        }
                    }
                })
                .catch((e) => {
                    // Rejected
                    action.logger.error(
                        `Failed to initialize action: ${
                            e instanceof Error ? e.message : String(e)
                        }`
                    );
                    if (onError) {
                        onError(e);
                    }
                });
        }

        return () => {
            isMounted = false;
        };
        // Purposly don't include onError so the caller doesn't have to use useCallback()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onActionInitialized, action]);

    if (!action || !action.isInitialized || loading) {
        // TODO: Need a common loading component
        return <></>;
    }

    // Unified form submission logic
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Store current form values before execution
            setLastTypedValues(action.form.values);

            const { success, error } = await action.execute(action.form.values);

            if (success) {
                if (onExecuteSucceeded) {
                    onExecuteSucceeded();
                }
            }

            if (error) {
                action.logger.error(
                    "Action execution failed: " +
                        (error instanceof Error ? error.message : String(error))
                );
                if (onExecuteFailed) {
                    // Restore the form values on failure to avoid clearing, only if lastTypedValues exists
                    if (lastTypedValues) {
                        action.form.setValues(lastTypedValues);
                    }
                    onExecuteFailed(error);
                }
            }
        } catch (e) {
            action.logger.error(
                `Unhandled error executing action: ${
                    e instanceof Error ? e.message : String(e)
                }`
            );
            if (onError) {
                onError(e);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle the Enter key submission
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && !submitting) {
            event.preventDefault(); // Prevent form from submitting automatically
            handleSubmit(); // Trigger form submission
        }
    };

    let allButtons: FormButton[] = [];
    if (hideSubmitButton !== true) {
        // Default submit button
        allButtons.push({
            label:
                props.submitButtonLabel ??
                translate("bonito.ui.form.buttons.apply"),
            primary: true,
            submitForm: true,
            disabled: submitting === true,
            onClick: handleSubmit, // Use the unified submit handler
        });
    }
    if (hideResetButton !== true) {
        // Default reset (discard) button
        allButtons.push({
            label:
                submitButtonLabel ??
                translate("bonito.ui.form.buttons.discardChanges"),
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
        <div onKeyDown={handleKeyDown}>
            <FormContainer
                form={action.form}
                layout={layout}
                onFormChange={onFormChange}
                onValidate={onValidate}
                buttons={allButtons}
            />
        </div>
    );
};
