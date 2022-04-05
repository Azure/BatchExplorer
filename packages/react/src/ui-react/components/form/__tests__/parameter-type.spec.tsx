import { Parameter } from "@batch/ui-common";
import { createForm, Form } from "@batch/ui-common/lib/form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { runAxe } from "../../../test-util/a11y";
import {
    StorageAccountDropdown,
} from "../parameter-type";

/**
 * Until React is upgraded to ≥16.9.
 * See https://www.npmjs.com/package/@testing-library/react
 */
const originalError = console.error;

/* KLUDGE: the parameter has to be called "subscriptionId" until we can specify
 * dependencies in parameter types
 */
type FakeFormValues = {
    subscriptionId?: string;
    storageAccountId?: string;
};

describe("Parameter type tests", () => {
    let user: UserEvent;
    let form: Form<FakeFormValues>;
    let subParam: Parameter<FakeFormValues, "subscriptionId">;
    beforeAll(() => {
        console.error = (...args) => {
            if (/Warning.*not wrapped in act/.test(args[0])) {
                return;
            }
            originalError.call(console, ...args);
        };
    });
    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
        form = createForm<FakeFormValues>({ values: {} });
        subParam = form.param("subscriptionId", "string");
    });

    describe("StorageAccountDropdown", () => {
        let storageParam: Parameter<FakeFormValues, "storageAccountId">;
        beforeEach(() => {
            storageParam = form.param("storageAccountId", "string");
        });

        test("simple dropdown", async () => {
            render(<StorageAccountDropdown param={storageParam} />);
            const element = screen.getByRole("combobox");
            await user.click(element);
            await waitFor(() => expectElementEnabled(element));
            expect(screen.queryAllByRole("option")).toEqual([]);
        });

        test("dropdown with subscription", async () => {
            render(
                <>
                    <SubscriptionDropdown param={subParam} />
                    <StorageAccountDropdown param={storageParam} />
                </>
            );
            const subDropdown = screen.getByRole("combobox", {
                name: /subscriptionId/,
            });
            const storageDropdown = screen.getByRole("combobox", {
                name: /storageAccountId/,
            });
            await user.click(subDropdown);
            await waitFor(() => {
                expectElementEnabled(subDropdown);
                expectElementEnabled(storageDropdown);
            });
            selectOption(0);
            await user.click(storageDropdown);

            let storageAccounts = await screen.findAllByRole("option");

            // Data served by FakeStorageAccountService
            expect(storageAccounts.length).toEqual(3);
            expect(storageAccounts[0].textContent).toEqual("Storage A");

            await user.click(subDropdown); // Reopen sub dropdown
            selectOption(2);
            await user.click(storageDropdown);

            storageAccounts = await screen.findAllByRole("option");

            expect(storageAccounts.length).toEqual(4);
            expect(storageAccounts[0].textContent).toEqual("Storage F");
        });

        test("bad subscription shows error", async () => {
            render(
                <>
                    <SubscriptionDropdown param={subParam} />
                    <StorageAccountDropdown param={storageParam} />
                </>
            );
            const subDropdown = screen.getByRole("combobox", {
                name: /subscriptionId/,
            });
            const storageDropdown = screen.getByRole("combobox", {
                name: /storageAccountId/,
            });
            await user.click(subDropdown);
            await waitFor(() => {
                expectElementEnabled(subDropdown);
                expectElementEnabled(storageDropdown);
            });
            selectOption(4); // Bad subscription
            expect(screen.getByText("Bad Subscription")).toBeDefined();

            await user.click(storageDropdown);

            expect(await screen.queryAllByRole("option")).toEqual([]);
            expect(
                screen.getByText("No storage accounts in subscription.")
            ).toBeDefined();
        });
    });

    afterAll(() => (console.error = originalError));
});

const expectElementEnabled = (element: HTMLElement) =>
    expect(element.className).not.toContain("is-disabled");

const selectOption = (index: number) =>
    fireEvent.click(screen.getAllByRole("option")[index]);
