import {
    Form,
    FormValues,
    ValidationSnapshot,
    ValidationStatus,
} from "../form";
import { getLogger } from "../logging";

export interface Action<V extends FormValues> {
    form: Form<V>;
    execute(formValues: V): Promise<ActionExecutionResult>;
    onValidateSync?(snapshot: ValidationSnapshot<V>): ValidationStatus;
    onValidateAsync?(
        snapshot: ValidationSnapshot<V>
    ): Promise<ValidationStatus>;
    onExecute(formValues: V): Promise<void>;
}

export type ActionExecutionResult = {
    success: boolean;
    error?: unknown;
    formValidationStatus: ValidationStatus;
};

export abstract class AbstractAction<V extends FormValues>
    implements Action<V>
{
    form: Form<V>;

    constructor(initialValues: V) {
        this.form = this.buildForm(initialValues);
        this.form.onValidateSync = (snapshot) => {
            return this._validateSync(snapshot);
        };
        this.form.onValidateAsync = (snapshot) => {
            return this._validateAsync(snapshot);
        };
    }

    private _validateSync(snapshot: ValidationSnapshot<V>): ValidationStatus {
        if (this.onValidateSync) {
            return this.onValidateSync(snapshot);
        }
        return new ValidationStatus("ok");
    }

    private async _validateAsync(
        snapshot: ValidationSnapshot<V>
    ): Promise<ValidationStatus> {
        if (this.onValidateAsync) {
            return this.onValidateAsync(snapshot);
        }
        return new ValidationStatus("ok");
    }

    async execute(): Promise<ActionExecutionResult> {
        // Store a reference to the current form values at the time validation
        // was run in case they change
        const formValues = this.form.values;

        // Finalize will force the validation to complete, and not be
        // pre-empted by a subsequent call to validate()
        const snapshot = await this.form.validate({ force: true });

        const validationStatus = snapshot.overallStatus;
        if (!validationStatus) {
            // This would indicate a bug
            throw new Error(
                "Form validation failed: validation status is null or undefined"
            );
        }

        const executionResult: ActionExecutionResult = {
            success: false,
            formValidationStatus: validationStatus,
        };

        if (validationStatus.level === "error") {
            // Validation failed - early out
            return executionResult;
        }

        try {
            await this.onExecute(formValues);
            executionResult.success = true;
        } catch (e) {
            executionResult.error = e;
            getLogger().warn("Action failed to execute:", e);
        }

        return executionResult;
    }

    abstract buildForm(initialValues: V): Form<V>;

    abstract onValidateSync?(snapshot: ValidationSnapshot<V>): ValidationStatus;

    abstract onValidateAsync?(
        snapshot: ValidationSnapshot<V>
    ): Promise<ValidationStatus>;

    abstract onExecute(formValues: V): Promise<void>;
}
