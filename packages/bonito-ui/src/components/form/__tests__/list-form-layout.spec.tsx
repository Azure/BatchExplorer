import { StringParameter } from "@azure/bonito-core/lib/form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { createReactForm } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { FormContainer } from "../form-container";

describe("ListFormLayout tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Can render a simple form", async () => {
        const user = userEvent.setup();

        const form = createReactForm<{
            make?: string;
            model?: string;
            description?: string;
        }>({
            values: {},
        });
        form.item("banner", {
            render: (props) => {
                return <div>Please enter the information below</div>;
            },
        });
        form.param("make", StringParameter, {
            label: "Make",
        });
        form.param("model", StringParameter, {
            label: "Model",
        });
        form.param("description", StringParameter, {
            label: "Description",
        });

        let saved: string | undefined;

        const { container } = render(
            <FormContainer
                form={form}
                layout="list"
                buttons={[
                    {
                        label: "Save",
                        onClick: () => {
                            const values = form.values;
                            saved = `Make: ${values.make}, Model: ${values.model}, Description: ${values.description}`;
                        },
                    },
                ]}
            />
        );

        const bannerEl = screen.getByText("Please enter the information below");
        expect(bannerEl).toBeDefined();

        const makeInput = screen.getByLabelText<HTMLInputElement>("Make");
        expect(makeInput).toBeDefined();
        await user.type(makeInput, "Volkswagen");
        expect(makeInput.value).toEqual("Volkswagen");

        const modelInput = screen.getByText("Model");
        expect(modelInput).toBeDefined();
        await user.type(modelInput, "GTI");

        const descriptionInput = screen.getByText("Description");
        expect(descriptionInput).toBeDefined();
        await user.type(descriptionInput, "Grey hatchback");

        const buttonEl = screen.getByRole("button", { name: "Save" });
        expect(buttonEl).toBeDefined();

        expect(saved).toBeUndefined();
        await user.click(buttonEl);
        expect(saved).toEqual(
            "Make: Volkswagen, Model: GTI, Description: Grey hatchback"
        );

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
