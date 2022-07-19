import { Parameter } from "@batch/ui-common";
import { createForm } from "@batch/ui-common/lib/form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import {
    StorageAccountDropdown,
    SubscriptionParamDropdown,
} from "../parameter-type";

/**
 * Until React is upgraded to ≥16.9.
 * See https://www.npmjs.com/package/@testing-library/react
 */
const originalError = console.error;

type FakeFormValues = {
    subId?: string;
};

describe("Parameter type tests", () => {
    let param: Parameter<FakeFormValues, "subId">;
    beforeAll(() => {
        console.error = (...args) => {
            if (/Warning.*not wrapped in act/.test(args[0])) {
                return;
            }
            originalError.call(console, ...args);
        };
    });
    beforeEach(() => initMockBrowserEnvironment());

    describe("SubscriptionParamDropdown", () => {
        let user: UserEvent;
        beforeEach(() => {
            param = createForm<FakeFormValues>({ values: {} }).param(
                "subId",
                "string"
            );
            user = userEvent.setup();
        });

        test("simple dropdown is accessible", async () => {
            render(<SubscriptionParamDropdown param={param} />);

            const element = screen.getByRole("combobox");
            expect(element).toBeDefined();
        });
        test("dropdown options", async () => {
            render(<SubscriptionParamDropdown param={param} />);
            const element = await screen.findByRole("combobox");
            await user.click(element);
            await waitFor(
                () => {
                    expect(element.className).not.toContain("is-disabled");
                },
                { timeout: 2000 }
            );
            const options = await screen.getAllByRole("option");
            expect(options.length).toEqual(5);
        });
        test("shows error on service error", () => {
            render(<SubscriptionParamDropdown param={param} />);
        });
    });
    describe("StorageAccountDropdown", () => {
        beforeEach(() => {
            param = createForm<FakeFormValues>({ values: {} }).param(
                "subId",
                "string"
            );
        });

        test("simple dropdown", () => {
            render(<StorageAccountDropdown param={param} />);
            const element = screen.getByRole("combobox");
            expect(element).toBeDefined();
        });
    });

    afterAll(() => {
        console.error = originalError;
    });
});
