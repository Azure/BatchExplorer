import {
    createForm,
    Form,
    ParameterType,
    ValidationSnapshot,
    ValidationStatus,
} from "../../form";
import { delay } from "../../util";
import { AbstractAction } from "../action";

describe("Action tests", () => {
    test("Simple action execution", async () => {
        const action = new HelloAction({});

        // Validation has not yet been run (but it will
        // be run automatically, just asynchronously)
        expect(action.onValidateCallCount).toEqual(0);
        expect(action.subjectOnValidateCallCount).toEqual(0);

        // Action hasn't been executed, message is the default
        expect(action.message).toEqual("Hello world");

        action.form.values = { subject: "universe" };

        await action.execute();

        // Action was executed, messaged changed
        expect(action.message).toEqual("Hello universe");

        // Validation should have only happened once
        expect(action.onValidateCallCount).toEqual(1);
        expect(action.subjectOnValidateCallCount).toEqual(1);

        // Check that no additional validations are pending
        await action.form.waitForValidation();
        expect(action.onValidateCallCount).toEqual(1);
        expect(action.subjectOnValidateCallCount).toEqual(1);
    });

    test("Action validation", async () => {
        const action = new HelloAction({});
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

        // Override parameter validation in form onValidate() to force success
        action.form.values.skipSubjectValidation = true;
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(3);
        expect(action.subjectOnValidateCallCount).toEqual(0);
        expect(action.form.validationStatus?.level).toEqual("ok");

        // Parameter onValidate failure
        action.form.values = {
            subject: "world",
        };
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(4);
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
        action.form.values = {
            subject: "universe",
        };
        await action.form.validate();
        expect(action.onValidateCallCount).toEqual(5);
        expect(action.subjectOnValidateCallCount).toEqual(2);
        expect(action.form.entryValidationStatus.subject?.level).toEqual("ok");
        expect(action.form.validationStatus?.level).toEqual("ok");

        // Execute action using form
        await action.execute();
        expect(action.message).toEqual("Hello universe");
    });

    type HelloFormValues = {
        subject?: string;
        skipSubjectValidation?: boolean;
    };

    class HelloAction extends AbstractAction<HelloFormValues> {
        message = "Hello world";
        onValidateCallCount = 0;
        subjectOnValidateCallCount = 0;

        override buildForm(
            initialValues: HelloFormValues
        ): Form<HelloFormValues> {
            const form = createForm<HelloFormValues>({
                values: initialValues,
            });

            form.param("subject", ParameterType.String, {
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

        onValidateSync(
            snapshot: ValidationSnapshot<HelloFormValues>
        ): ValidationStatus {
            return new ValidationStatus("ok");
        }

        async onValidateAsync(
            snapshot: ValidationSnapshot<HelloFormValues>
        ): Promise<ValidationStatus> {
            this.onValidateCallCount++;

            // Validate in a non-blocking fashion
            await delay();

            if (snapshot.values.skipSubjectValidation) {
                snapshot.ok("subject");
            }
            return new ValidationStatus("ok");
        }

        async onExecute(formValues: HelloFormValues): Promise<void> {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    this.message = `Hello ${formValues.subject}`;
                    resolve();
                }, 0);
            });
        }
    }
});
