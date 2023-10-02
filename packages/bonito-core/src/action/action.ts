import { Form, FormValues, ValidationStatus } from "../form";
import { getLogger, Logger } from "../logging";
import { Deferred } from "../util";

export interface Action<V extends FormValues = FormValues> {
    /**
     * A globally unique friendly name for this action. Used for logging, etc.
     */
    readonly actionName: string;

    /**
     * A logger which is pre-configured with the name of the action
     */
    readonly logger: Logger;

    /**
     * The form associated with this action.
     */
    readonly form: Form<V>;

    /**
     * True if initialization has finished.
     */
    readonly isInitialized: boolean;

    /**
     * The result the last time the action was executed (or undefined if
     * the action hasn't been executed yet)
     */
    readonly lastExecutionResult?: ActionExecutionResult;

    /**
     * Load data needed for the action and perform any other initialization.
     * Calls the onInitialize() callback.
     */
    initialize(): Promise<void>;

    /**
     * A callback which performs action initialization.
     */
    onInitialize(): Promise<V>;

    /**
     * Constructs the form for the action.
     *
     * @param initialValues Initial values to populate the form with.
     */
    buildForm(initialValues: V): Form<V>;

    /**
     * Execute the action and return a result (which may be success or failure)
     * @param formValues The form values to use to execute the action.
     */
    execute(formValues: V): Promise<ActionExecutionResult>;

    /**
     * A callback which performs validation synchronously. Note that both
     * onValidateSync and onValidateAsync will be called for every validation.
     * The onValidateSync callback will simply return more quickly.
     *
     * @param formValues The form values to validate
     */
    onValidateSync?(formValues: V): ValidationStatus;

    /**
     * A callback which performs validation asynchronously. Note that both
     * onValidateSync and onValidateAsync will be called for every validation.
     * The onValidateSync callback will simply return more quickly.
     *
     * @param formValues The form values to validate
     */
    onValidateAsync?(formValues: V): Promise<ValidationStatus>;

    /**
     * A callback which performs action execution.
     *
     * @param formValues The form values to use
     */
    onExecute(formValues: V): Promise<ActionExecutionResult | void>;

    /**
     * Returns a promise that resolves when action execution
     * has finished. If there is no execution currently in-progress,
     * the promise will resolve immediately.
     */
    waitForExecution(): Promise<ActionExecutionResult | void>;

    /**
     * Returns a promise that resolves when action initialization
     * has finished. If there is no initialization currently in-progress,
     * the promise will resolve immediately.
     */
    waitForInitialization(): Promise<void>;
}

export type ActionExecutionResult = {
    success: boolean;
    error?: unknown;
    validationStatus: ValidationStatus;
};

export abstract class AbstractAction<V extends FormValues>
    implements Action<V>
{
    abstract actionName: string;

    private _logger: Logger | undefined;

    /**
     * Get a logger for the action
     */
    get logger(): Logger {
        // In practice this should never be undefined
        const actionName = this.actionName ?? "UnknownAction";
        if (!this._logger) {
            this._logger = getLogger(`Action-${actionName}`);
        }
        return this._logger;
    }

    private _lastExecutionResult?: ActionExecutionResult;

    get lastExecutionResult(): ActionExecutionResult | undefined {
        return this._lastExecutionResult;
    }

    protected _form?: Form<V>;

    private _isInitialized: boolean = false;

    private _isExecuting = false;
    private _executionDeferred = new Deferred<ActionExecutionResult>();

    private _isInitializing = false;
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
        try {
            this._isInitializing = true;

            const initialValues = await this.onInitialize();

            this._form = this.buildForm(initialValues);
            this.form.onValidateSync = (values) => {
                return this._validateSync(values);
            };
            this.form.onValidateAsync = (values) => {
                return this._validateAsync(values);
            };

            this._isInitialized = true;
        } finally {
            // Always resolve rather than reject. Waiting for initialization
            // isn't the right place to handle errors. Instead, handle rejections
            // from initialize() itself.
            this._initializationDeferred.resolve();
            this._isInitializing = false;
        }
    }

    waitForInitialization(): Promise<void> {
        if (!this._isInitializing || this._initializationDeferred.done) {
            return Promise.resolve();
        } else {
            return this._initializationDeferred.promise;
        }
    }

    waitForExecution(): Promise<ActionExecutionResult | undefined> {
        if (!this._isExecuting || this._executionDeferred.done) {
            if (this._executionDeferred.done) {
                return Promise.resolve(this._executionDeferred.resolvedTo);
            } else {
                return Promise.resolve(undefined);
            }
        } else {
            return this._executionDeferred.promise;
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
        let executionResult: ActionExecutionResult = {
            success: false,
            // Default to error status in case an exception is thrown
            validationStatus: new ValidationStatus(
                "error",
                "Failed to execute action"
            ),
        };

        try {
            this._isExecuting = true;

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

            executionResult.validationStatus = validationStatus;
            if (validationStatus.level === "error") {
                // Validation failed - early out
                this._lastExecutionResult = executionResult;
                return executionResult;
            }

            try {
                const result = await this.onExecute(formValues);
                if (result) {
                    executionResult = result;
                } else {
                    executionResult.success = true;
                }
            } catch (e) {
                executionResult.error =
                    e ?? "Failed to execute action " + this.actionName;
                executionResult.validationStatus = new ValidationStatus(
                    "error",
                    `${String(e)}`
                );
                this.logger.warn("Action failed to execute:", e);
            }
        } finally {
            this._isExecuting = false;

            // Always resolve rather than reject. Waiting for execution
            // isn't the right place to handle errors. Instead, handle rejections
            // from execute() itself.
            this._executionDeferred.resolve(executionResult);

            // Create a new deferred execution object since execution
            // can happen again and again
            this._executionDeferred = new Deferred<ActionExecutionResult>();
        }

        this._lastExecutionResult = executionResult;

        if (!executionResult.success) {
            this.form.forceValidationStatus(
                this._lastExecutionResult.validationStatus
            );
        }

        return executionResult;
    }

    abstract onInitialize(): Promise<V>;

    abstract buildForm(initialValues: V): Form<V>;

    abstract onExecute(formValues: V): Promise<ActionExecutionResult | void>;

    onValidateSync?(values: V): ValidationStatus;

    onValidateAsync?(values: V): Promise<ValidationStatus>;
}
