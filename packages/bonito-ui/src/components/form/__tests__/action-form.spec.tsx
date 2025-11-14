import { createForm } from "@azure/bonito-core";
import {
    AbstractAction,
    ActionExecutionResult,
} from "@azure/bonito-core/lib/action";
import {
    BooleanParameter,
    Form,
    NumberParameter,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { ActionForm } from "../action-form";

describe("Action form tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Can render a simple action", async () => {
        const action = new PetDogAction({});

        const { container } = render(<ActionForm action={action} />);
        expect(await screen.findByText("Dog name")).toBeDefined();
        expect(await screen.findByText("Pet how many times?")).toBeDefined();
        expect(await screen.findByText("Give a treat?")).toBeDefined();

        expect(await runAxe(container)).toHaveNoViolations();
    });

    test("Can handle initialization errors", async () => {
        const action = new PetDogAction({
            throwInitializationError: true,
        });

        let err: string | undefined;
        render(
            <ActionForm
                action={action}
                onError={(e) => {
                    err = (e as Error).message;
                }}
            />
        );

        await waitFor(() => {
            expect(err).toEqual("Fake initialization error");
        });
    });

    test("Can submit and reset using the built-in buttons", async () => {
        userEvent.setup();

        let petCount = 0;
        const action = new PetDogAction(
            {
                numberOfPets: 1,
            },
            (count) => {
                petCount = count;
            }
        );

        render(<ActionForm action={action} />);

        const submitButton = await screen.findByRole("button", {
            name: "Apply",
        });
        expect(submitButton).toBeDefined();
        expect(petCount).toBe(0);

        await act(async () => {
            action.form.updateValue("numberOfPets", 1);
            await userEvent.click(submitButton);
            await action.waitForExecution();
        });
        expect(petCount).toBe(1);

        await act(async () => {
            action.form.updateValue("numberOfPets", 2);
            await userEvent.click(submitButton);
            await action.waitForExecution();
        });
        expect(petCount).toBe(2);

        // Reset back to initial values
        const resetButton = await screen.findByRole("button", {
            name: "Discard changes",
        });
        await userEvent.click(resetButton);
        expect(action.form.values).toStrictEqual({
            numberOfPets: 1,
        });
    });

    test("Validation errors are shown properly", async () => {
        userEvent.setup();

        const action = new PetDogAction({
            dogName: "Baron Maximilian Augustus von Woofington",
        });

        render(<ActionForm action={action} />);

        const submitButton = await screen.findByRole("button", {
            name: "Apply",
        });
        expect(submitButton).toBeDefined();

        await act(async () => {
            await userEvent.click(submitButton);
            await action.waitForExecution();
        });
        expect(action.form.validationStatus?.level).toBe("error");
        expect(action.lastExecutionResult?.validationStatus.level).toBe(
            "error"
        );

        const alerts = await screen.findAllByRole("alert");
        expect(alerts.length).toBe(2);

        await waitFor(() => {
            // Validation error on input
            expect(alerts[0].textContent).toBe(
                "Dog names cannot be greater than 10 characters"
            );
            // Validation error on summary
            expect(alerts[1].textContent).toBe(
                "Dog names cannot be greater than 10 characters"
            );
        });

        await act(async () => {
            action.form.updateValue("dogName", "f1d0");
            await userEvent.click(submitButton);
            await action.waitForExecution();
        });
        // Action execution failure cascades to the form as a validation error
        expect(action.form.validationStatus?.level).toBe("error");
        expect(action.form.validationStatus?.message).toBe(
            "Dog names cannot contain numbers"
        );
        expect(action.lastExecutionResult?.validationStatus.level).toBe(
            "error"
        );
        expect(action.lastExecutionResult?.validationStatus.message).toBe(
            "Dog names cannot contain numbers"
        );

        const alert = await screen.findByRole("alert");
        // Only one validation error this time because the error isn't associated
        // with a form entry (it came from the action execution)
        expect(alert.textContent).toBe("Dog names cannot contain numbers");

        // Reset back to initial values
        const resetButton = await screen.findByRole("button", {
            name: "Discard changes",
        });
        await userEvent.click(resetButton);
        expect(action.form.values).toStrictEqual({
            dogName: "Baron Maximilian Augustus von Woofington",
        });
    });
});

type PetDogFormValues = {
    dogName?: string;
    numberOfPets?: number;
    giveTreat?: boolean;
    throwInitializationError?: boolean;
    throwExecutionError?: boolean;
};

class PetDogAction extends AbstractAction<PetDogFormValues> {
    actionName = "PetDog";

    onPet?: (count: number) => void;
    private _initialValues: PetDogFormValues = {};

    constructor(
        initialValues?: PetDogFormValues,
        onPet?: (count: number) => void
    ) {
        super();
        if (initialValues) {
            this._initialValues = initialValues;
        }
        this.onPet = onPet;
    }

    async onInitialize(): Promise<PetDogFormValues> {
        if (this._initialValues.throwInitializationError) {
            throw new Error("Fake initialization error");
        }
        return this._initialValues;
    }

    buildForm(): Form<PetDogFormValues> {
        const form = createForm<PetDogFormValues>({
            values: this._initialValues,
        });

        form.param("dogName", StringParameter, {
            label: "Dog name",
            onValidateSync: (value) => {
                if (value && value.length > 10) {
                    return new ValidationStatus(
                        "error",
                        "Dog names cannot be greater than 10 characters"
                    );
                }
                return new ValidationStatus("ok");
            },
        });

        form.param("numberOfPets", NumberParameter, {
            label: "Pet how many times?",
            value: 100,
            onValidateSync: (value) => {
                if (value == null) {
                    return new ValidationStatus(
                        "error",
                        "Number of pets must be defined"
                    );
                }
                if (value <= 0) {
                    return new ValidationStatus(
                        "error",
                        "Number of pets cannot be less than 1"
                    );
                }
                return new ValidationStatus("ok");
            },
        });

        form.param("giveTreat", BooleanParameter, {
            label: "Give a treat?",
        });

        return form;
    }

    onValidateSync(): ValidationStatus {
        return new ValidationStatus("ok");
    }

    async onValidateAsync(): Promise<ValidationStatus> {
        return new ValidationStatus("ok");
    }

    async onExecute(
        formValues: PetDogFormValues
    ): Promise<ActionExecutionResult> {
        if (formValues.dogName?.match(/[0-9]/)) {
            return {
                success: false,
                validationStatus: new ValidationStatus(
                    "error",
                    "Dog names cannot contain numbers"
                ),
            };
        }

        if (this.onPet && formValues.numberOfPets != undefined) {
            this.onPet(formValues.numberOfPets);
        }
        return {
            success: true,
            validationStatus: new ValidationStatus("ok"),
        };
    }
}
