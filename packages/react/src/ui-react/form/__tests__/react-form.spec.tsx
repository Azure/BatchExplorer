import * as React from "react";
import { StringParameter } from "@batch/ui-common/lib/form";
import { initMockBrowserEnvironment } from "../../environment";
import { createReactForm } from "../react-form";
import { render, screen } from "@testing-library/react";
import { FormContainer } from "../../components/form";

describe("ReactForm tests", () => {
    beforeEach(() => initMockBrowserEnvironment());

    test("Custom parameter rendering", () => {
        type HelloWorldFormValues = {
            message: string;
        };

        const form = createReactForm<HelloWorldFormValues>({
            values: {
                message: "Hello world!",
            },
        });

        form.param("message", StringParameter, {
            render: (props) => {
                const { param } = props;
                return (
                    <div data-testid="custom-param-render">{param.value}</div>
                );
            },
        });

        form.item("Custom Item", {
            render: (props) => {
                return (
                    <div data-testid="custom-item-render">
                        Message was {props.values.message}
                    </div>
                );
            },
        });

        render(<FormContainer form={form} />);

        const messageEl = screen.getByTestId("custom-param-render");
        expect(messageEl).toBeDefined();
        expect(messageEl.textContent).toEqual("Hello world!");

        const bannerEl = screen.getByTestId("custom-item-render");
        expect(screen.getByTestId("custom-item-render")).toBeDefined();
        expect(bannerEl).toBeDefined();
        expect(bannerEl.textContent).toEqual("Message was Hello world!");
    });
});
