import { createForm, ParameterType } from "@batch/ui-common";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import { FormContainer } from "../form-container";

describe("Form container tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Can render a simple form", async () => {
        const form = createForm<{
            make?: string;
            model?: string;
            description?: string;
        }>({
            values: {},
        });
        form.param("make", ParameterType.String, {
            title: "Make",
        });
        form.param("model", ParameterType.String, {
            title: "Model",
        });
        form.param("description", ParameterType.String, {
            title: "Description",
        });

        const { container } = render(<FormContainer form={form} />);
        expect(await screen.findByText("Make")).toBeDefined();
        expect(await screen.findByText("Model")).toBeDefined();
        expect(await screen.findByText("Description")).toBeDefined();

        expect(await runAxe(container)).toHaveNoViolations();
    });
});
