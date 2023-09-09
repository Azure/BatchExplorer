import { initMockEnvironment } from "../../environment";
import { createForm, Form, ValidationStatus } from "../../form";
import { StringParameter } from "../../form/string-parameter";
import { delay, mergeDeep } from "../../util";
import { AbstractAction, ActionExecutionResult } from "../action";

describe("Action tests", () => {
    beforeEach(() => initMockEnvironment());

    test("Simple action execution", async () => {
        const action = new HelloAction({
            subject: "planet",
        });

        expect(action.actionName).toEqual("Hello");
        expect(action.logger.context.area).toEqual("Action-Hello");

        // Test that we can call waitFor() functions even while execute/initialize
        // aren't running, and they return immediately
        await action.waitForInitialization();
        await action.waitForExecution();

        action.initialize();

        expect(action.isInitialized).toBe(false);

        // This should be the same as waiting for the init promise above
        await action.waitForInitialization();
        expect(action.isInitialized).toBe(true);

        // Initial form values from onInitialize function
        expect(action.form.values).toStrictEqual({
            subject: "planet",
            sender: "Contoso",
        });

        // Validation has not yet been run (but it will
        // be run automatically, just asynchronously)
        expect(action.onValidateCallCount).toEqual(0);
        expect(action.subjectOnValidateCallCount).toEqual(0);

        // Action hasn't been executed, message is the default
        expect(action.message).toEqual("Hola world");

        // Executing adds the sender
        const result = await action.execute();
        expect(result.validationStatus.level).toEqual("ok");
        expect(action.message).toEqual("Hello planet from Contoso");

        // Can change form values and execute again
        action.form.updateValue("subject", "universe");
        action.execute();
        // Calling waitForExecution() should be the same as awaiting
        // the execute() return value
        await action.waitForExecution();
        expect(action.message).toEqual("Hello universe from Contoso");

        // Validation should have only happened once per execution
        expect(action.onValidateCallCount).toEqual(2);
        expect(action.subjectOnValidateCallCount).toEqual(2);

        // Check that no additional validations are pending
        await action.form.waitForValidation();
        expect(action.onValidateCallCount).toEqual(2);
        expect(action.subjectOnValidateCallCount).toEqual(2);
    });

    test("Action validation", async () => {
        const action = new HelloAction({});
        await action.initialize();

        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(1);
        // Subject parameter's onValidate() was not called
        // because validation failed the required check
        expect(action.subjectOnValidateCallCount).toEqual(0);

        // Calling validate() several times in a row in a blocking fashion
        // should only result in a single call to onValidate()
        action.form.validate();
        action.form.validate();
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(2);
        expect(action.subjectOnValidateCallCount).toEqual(0);

        // Required validation failure
        expect(action.form.entryValidationStatus.subject?.level).toEqual(
            "error"
        );
        expect(action.form.entryValidationStatus.subject?.message).toEqual(
            "Subject is required"
        );
        expect(action.form.validationStatus?.level).toEqual("error");
        expect(action.form.validationStatus?.message).toEqual(
            "Subject is required"
        );

        // Parameter onValidate failure
        action.form.setValues({
            subject: "world",
        });
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(3);
        // Subject onValidate() was called now that the required check passed
        expect(action.subjectOnValidateCallCount).toEqual(1);
        expect(action.form.entryValidationStatus.subject?.level).toEqual(
            "error"
        );
        expect(action.form.entryValidationStatus.subject?.message).toEqual(
            `Value cannot be "world"`
        );
        expect(action.form.validationStatus?.level).toEqual("error");
        expect(action.form.validationStatus?.message).toEqual(
            'Value cannot be "world"'
        );

        // Normal success
        action.form.setValues({
            subject: "universe",
        });
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(4);
        expect(action.subjectOnValidateCallCount).toEqual(2);
        expect(action.form.entryValidationStatus.subject?.level).toEqual("ok");
        expect(action.form.validationStatus?.level).toEqual("ok");

        // Execute action using form
        const successResult = await action.execute();
        expect(action.message).toEqual("Hello universe");
        expect(successResult.success).toBe(true);
        expect(successResult.error).toBeUndefined();
        expect(successResult.validationStatus.level).toBe("ok");

        // Execute again, but this time the execution will return a validation error
        action.form.updateValue("subject", "invalid");
        const failResult = await action.execute();
        expect(failResult.success).toBe(false);
        expect(failResult.error).toBeUndefined();
        expect(failResult.validationStatus.level).toBe("error");

        // Can fix the error and submit again
        action.form.updateValue("subject", "valid subject");
        const successResult2 = await action.execute();
        expect(action.message).toEqual("Hello valid subject");
        expect(successResult2.success).toBe(true);
        expect(successResult2.error).toBeUndefined();
        expect(successResult2.validationStatus.level).toBe("ok");
    });

    type HelloFormValues = {
        subject?: string;
        sender?: string;
    };

    class HelloAction extends AbstractAction<HelloFormValues> {
        actionName = "Hello";

        message = "Hola world";
        onValidateCallCount = 0;
        subjectOnValidateCallCount = 0;

        private _initialValues: HelloFormValues;

        constructor(initialValues: HelloFormValues) {
            super();
            this._initialValues = initialValues;
        }

        async onInitialize(): Promise<HelloFormValues> {
            await delay();

            // Simulate the case where we want to combine
            // some form values specified at action creation time
            // and some from loaded data
            const merged = mergeDeep(
                {
                    sender: "Contoso",
                },
                this._initialValues
            );
            return merged;
        }

        override buildForm(
            initialValues: HelloFormValues
        ): Form<HelloFormValues> {
            const form = createForm<HelloFormValues>({
                values: initialValues,
            });

            form.param("subject", StringParameter, {
                label: "Subject",
                required: true,
                onValidateAsync: async (value) => {
                    this.subjectOnValidateCallCount++;
                    if (value === "world") {
                        return new ValidationStatus(
                            "error",
                            `Value cannot be "world"`
                        );
                    }
                    return new ValidationStatus("ok");
                },
            });

            return form;
        }

        onValidateSync(values: HelloFormValues): ValidationStatus {
            return new ValidationStatus("ok");
        }

        async onValidateAsync(
            values: HelloFormValues
        ): Promise<ValidationStatus> {
            this.onValidateCallCount++;

            // Validate in a non-blocking fashion
            await delay();

            return new ValidationStatus("ok");
        }

        async onExecute(
            formValues: HelloFormValues
        ): Promise<ActionExecutionResult> {
            return new Promise<ActionExecutionResult>((resolve) => {
                setTimeout(() => {
                    const result: ActionExecutionResult = {
                        success: true,
                        validationStatus: new ValidationStatus("ok"),
                    };

                    this.message = `Hello ${formValues.subject}`;
                    if (formValues.sender) {
                        this.message += ` from ${formValues.sender}`;
                    }

                    if (formValues.subject === "invalid") {
                        result.success = false;
                        result.validationStatus = new ValidationStatus(
                            "error",
                            "Invalid subject"
                        );
                    }

                    resolve(result);
                }, 0);
            });
        }
    }
});
