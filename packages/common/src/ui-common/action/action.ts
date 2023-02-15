import { Form, FormValues, ValidationStatus } from "../form";
import { getLogger } from "../logging";
import { Deferred } from "../util";

export interface Action<V extends FormValues = FormValues> {
    form: Form<V>;
    isInitialized: boolean;
    initialize(): Promise<void>;
    onInitialize(): Promise<V>;
    execute(formValues: V): Promise<ActionExecutionResult>;
    onValidateSync?(formValues: V): ValidationStatus;
    onValidateAsync?(formValues: V): Promise<ValidationStatus>;
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
    protected _form?: Form<V>;

    private _isInitialized: boolean = false;
    private _initializationDeferred = new Deferred();

    /**
     * The action's form, built from the buildForm function when the action
     * is initialized. Note that if the action has not yet been initialized,
     * trying to access the form will throw an error.
     */
    get form(): Form<V> {
        if (!this._form) {
            throw new Error(
                "Unable to get form: the action is not yet initialized"
            );
        }
        return this._form;
    }

    get isInitialized(): boolean {
        return this._isInitialized;
    }

    async initialize(): Promise<void> {
        const initialValues = await this.onInitialize();
        this._form = this.buildForm(initialValues);
        this.form.onValidateSync = (values) => {
            return this._validateSync(values);
        };
        this.form.onValidateAsync = (values) => {
            return this._validateAsync(values);
        };

        this._isInitialized = true;
        this._initializationDeferred.resolve();
    }

    waitForInitialization(): Promise<void> {
        if (this._initializationDeferred.done) {
            return Promise.resolve();
        } else {
            return this._initializationDeferred.promise;
        }
    }

    private _validateSync(values: V): ValidationStatus {
        if (this.onValidateSync) {
            return this.onValidateSync(values);
        }
        return new ValidationStatus("ok");
    }

    private async _validateAsync(values: V): Promise<ValidationStatus> {
        if (this.onValidateAsync) {
            return this.onValidateAsync(values);
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

    abstract onInitialize(): Promise<V>;

    abstract buildForm(initialValues: V): Form<V>;

    abstract onExecute(formValues: V): Promise<void>;

    abstract onValidateSync(values: V): ValidationStatus;

    onValidateAsync?(values: V): Promise<ValidationStatus>;
}
