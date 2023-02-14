import { Parameter } from "@batch/ui-common";
import { createForm, Form } from "@batch/ui-common/lib/form";
import { inject } from "@batch/ui-common/lib/environment";
import { FakeSubscriptionService } from "@batch/ui-service";
import { BasicFakeSet } from "@batch/ui-service/lib/test-util/fakes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import {
    BrowserDependencyName,
    initMockBrowserEnvironment,
} from "../../../environment";
import { StorageAccountParameter, SubscriptionParameter } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { StorageAccountDropdown } from "../storage-account-dropdown";
import { SubscriptionDropdown } from "../subscription-dropdown";

/* KLUDGE: the parameter has to be called "subscriptionId" until we can specify
 * dependencies in parameter types
 */
type FakeFormValues = {
    subscriptionId?: string;
    storageAccountId?: string;
};

describe("Storage account dropdown", () => {
    let user: UserEvent;
    let form: Form<FakeFormValues>;
    let subParam: Parameter<FakeFormValues, "subscriptionId">;
    let storageParam: Parameter<FakeFormValues, "storageAccountId">;

    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
        form = createForm<FakeFormValues>({ values: {} });
        subParam = form.param("subscriptionId", SubscriptionParameter);
        storageParam = form.param("storageAccountId", StorageAccountParameter);
    });

    test("simple dropdown", async () => {
        render(<StorageAccountDropdown param={storageParam} />);
        const element = screen.getByRole("combobox");
        await user.click(element);
        await waitFor(() => expectElementEnabled(element));
        expect(screen.queryAllByRole("option")).toEqual([]);
    });

    test("dropdown is accessible", async () => {
        const { container } = render(
            <StorageAccountDropdown param={storageParam} />
        );

        // KLUDGE: Flush the rendering because of async calls in hooks.
        await waitFor(() => null);

        expect(
            await runAxe(container, {
                rules: {
                    // See: https://github.com/microsoft/fluentui/issues/19090
                    "aria-required-children": { enabled: false },
                },
            })
        ).toHaveNoViolations();
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

        await selectOption(0);
        await user.click(storageDropdown);

        let storageAccounts = await screen.findAllByRole("option");

        // Data served by FakeStorageAccountService
        expect(storageAccounts.length).toEqual(3);
        expect(storageAccounts[0].textContent).toEqual("Storage A");

        await user.click(subDropdown); // Reopen sub dropdown
        await selectOption(1);
        await user.click(storageDropdown);

        storageAccounts = await screen.findAllByRole("option");

        expect(storageAccounts.length).toEqual(2);
        expect(storageAccounts[0].textContent).toEqual("Storage D");
    });

    test("bad subscription shows error", async () => {
        const subService: FakeSubscriptionService = inject(
            BrowserDependencyName.SubscriptionService
        );

        // Add a bad subscription
        const fakeSet = new BasicFakeSet();
        fakeSet.subscriptions["/fake/badsub"] = {
            id: "/fake/badsub",
            subscriptionId: "badsub",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "Bad Subscription",
            state: "PastDue",
        };
        subService.useFakeSet(fakeSet);

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
        await selectOption(2); // Bad subscription
        expect(screen.getByText("Bad Subscription")).toBeDefined();

        await user.click(storageDropdown);

        expect(await screen.queryAllByRole("option")).toEqual([]);
        expect(
            screen.getByText("Error: No storage accounts in subscription.")
        ).toBeDefined();
    });

    const expectElementEnabled = (element: HTMLElement) =>
        expect(element.className).not.toContain("is-disabled");

    const selectOption = async (index: number) =>
        await user.click(screen.getAllByRole("option")[index]);
});
