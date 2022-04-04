import { createForm, Form, ParameterType, ValidationStatus } from "../../form";
import { AbstractAction } from "../action";

describe("Action tests", () => {
    test("Simple action execution", async () => {
        const action = new HelloAction({});

        // Action hasn't been executed, message is the default
        expect(action.message).toEqual("Hello world");

        await action.execute({ subject: "universe" });

        // Action was executed, messaged changed
        expect(action.message).toEqual("Hello universe");
    });

    test("Action validation", async () => {
        const action = new HelloAction({});
        await action.validate();

        // Required validation failure
        expect(action.form.entryValidationStatus.subject?.level).toEqual(
            "error"
        );
        expect(action.form.entryValidationStatus.subject?.message).toEqual(
            "Value must not be empty"
        );
        expect(action.form.validationStatus?.level).toEqual("error");
        expect(action.form.validationStatus?.message).toEqual("1 error found");

        // Override parameter validation in form onValidate() to force success
        action.form.values.skipSubjectValidation = true;
        await action.validate();
        expect(action.form.validationStatus?.level).toEqual("ok");

        // Parameter onValidate failure
        action.form.values = {
            subject: "world",
        };
        await action.validate();
        expect(action.form.entryValidationStatus.subject?.level).toEqual(
            "error"
        );
        expect(action.form.entryValidationStatus.subject?.message).toEqual(
            `Value cannot be "world"`
        );
        expect(action.form.validationStatus?.level).toEqual("error");
        expect(action.form.validationStatus?.message).toEqual("1 error found");

        // Normal success
        action.form.values = {
            subject: "universe",
        };
        await action.validate();
        expect(action.form.entryValidationStatus.subject?.level).toEqual("ok");
        expect(action.form.validationStatus?.level).toEqual("ok");

        // Execute action using form
        await action.execute(action.form.values);
        expect(action.message).toEqual("Hello universe");
    });

    type HelloFormValues = {
        subject?: string;
        skipSubjectValidation?: boolean;
    };

    class HelloAction extends AbstractAction<HelloFormValues> {
        message = "Hello world";

        buildForm(initialValues: HelloFormValues): Form<HelloFormValues> {
            const form = createForm<HelloFormValues>({
                values: initialValues,
            });

            form.param("subject", ParameterType.String, {
                label: "Subject",
                required: true,
                onValidate: async (value) => {
                    if (value === "world") {
                        return new ValidationStatus(
                            "error",
                            `Value cannot be "world"`
                        );
                    }
                    return new ValidationStatus("ok", "Validation passed");
                },
            });

            return form;
        }

        async onValidate(): Promise<void> {
            if (this.form.values.skipSubjectValidation) {
                this.form.ok("subject", "Validation passed");
            }
        }

        async execute(formValues: HelloFormValues): Promise<void> {
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    this.message = `Hello ${formValues.subject}`;
                    resolve();
                }, 0);
            });
        }
    }
});
