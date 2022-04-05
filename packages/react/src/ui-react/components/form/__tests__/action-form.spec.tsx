import { createForm, Form, ParameterType } from "@batch/ui-common";
import { AbstractAction } from "@batch/ui-common/lib/action";
import { ValidationStatus } from "@batch/ui-common/lib/form";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { ActionForm } from "../action-form";

describe("Action form tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Can render a simple action", async () => {
        const form = createForm<{
            make?: string;
            model?: string;
            description?: string;
        }>({
            values: {},
        });
        form.param("make", ParameterType.String, {
            label: "Make",
        });
        form.param("model", ParameterType.String, {
            label: "Model",
        });
        form.param("description", ParameterType.String, {
            label: "Description",
        });

        const action = new PetDogAction({});

        const { container } = render(<ActionForm action={action} />);
        expect(await screen.findByText("Dog name")).toBeDefined();
        expect(await screen.findByText("Pet how many times?")).toBeDefined();
        expect(await screen.findByText("Give a treat?")).toBeDefined();

        expect(await runAxe(container)).toHaveNoViolations();
    });
});

type PetDogFormValues = {
    dogName?: string;
    numberOfPets?: number;
    giveTreat?: boolean;
};

class PetDogAction extends AbstractAction<PetDogFormValues> {
    onPet?: (count: number) => void;

    constructor(
        initialValues: PetDogFormValues,
        onPet?: (count: number) => void
    ) {
        super(initialValues);
        this.onPet = onPet;
    }

    buildForm(): Form<PetDogFormValues> {
        const form = createForm<PetDogFormValues>({
            values: {
                giveTreat: true,
            },
        });

        form.param("dogName", ParameterType.String, {
            label: "Dog name",
        });

        form.param("numberOfPets", ParameterType.String, {
            label: "Pet how many times?",
            value: 100,
            onValidate: async (value) => {
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
                return new ValidationStatus("ok", "Validation passed");
            },
        });

        form.param("giveTreat", ParameterType.String, {
            label: "Give a treat?",
        });

        return form;
    }

    async onValidate(): Promise<void> {
        // no-op
    }

    async execute(formValues: PetDogFormValues): Promise<void> {
        if (this.onPet && formValues.numberOfPets != undefined) {
            this.onPet(formValues.numberOfPets);
        }
    }
}
