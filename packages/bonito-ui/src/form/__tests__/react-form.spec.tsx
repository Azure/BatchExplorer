import * as React from "react";
import { StringParameter } from "@azure/bonito-core/lib/form";
import { initMockBrowserEnvironment } from "../../environment";
import { createReactForm, createParam } from "../react-form";
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

        // Parameters inside forms have standalone set to undefined by default
        expect(form.getParam("message").standalone).toBeUndefined();
    });

    test("Standalone parameter creation", () => {
        const param = createParam(StringParameter, {
            value: "testing 1 2 3",
        });
        expect(param.value).toEqual("testing 1 2 3");
        expect(param.parentForm).toBeDefined();
        expect(param.parentForm.values).toStrictEqual({
            [param.name]: "testing 1 2 3",
        });

        // Always set to true when using createParam()
        expect(param.standalone).toBe(true);
    });
});
