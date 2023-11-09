import { FakeSubscriptionService } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import { createForm, Form } from "@azure/bonito-core/lib/form";
import { BasicFakeSet } from "@azure/bonito-core/lib/test-util";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import * as React from "react";
import { act } from "react-dom/test-utils";
import { initMockBrowserEnvironment } from "../../../environment";
import {
    StorageAccountDependencies,
    StorageAccountParameter,
    SubscriptionParameter,
} from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { StorageAccountDropdown } from "../storage-account-dropdown";
import { SubscriptionDropdown } from "../subscription-dropdown";

type FakeFormValues = {
    subId?: string;
    storageAccountId?: string;
};

describe("Storage account dropdown", () => {
    let user: UserEvent;
    let form: Form<FakeFormValues>;
    let subParam: SubscriptionParameter<FakeFormValues, "subId">;
    let storageParam: StorageAccountParameter<
        FakeFormValues,
        "storageAccountId",
        StorageAccountDependencies<FakeFormValues>
    >;

    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
        form = createForm<FakeFormValues>({ values: {} });
        subParam = form.param("subId", SubscriptionParameter);
        storageParam = form.param("storageAccountId", StorageAccountParameter, {
            dependencies: {
                subscriptionId: "subId",
            },
        });
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
            name: /subId/,
        });
        const storageDropdown = screen.getByRole("combobox", {
            name: /storageAccountId/,
        });
        await user.click(subDropdown);
        await waitFor(() => {
            expectElementEnabled(subDropdown);
            expectElementEnabled(storageDropdown);
        });

        // Tanuki sub
        await selectOption(1);
        await user.click(storageDropdown);

        let options = await screen.findAllByRole("option");

        // Data served by FakeStorageAccountService
        expect(options.length).toEqual(3);
        expect(options.map((option) => option.textContent)).toEqual([
            // Sorted alphabetically
            "storageA",
            "storageB",
            "storageC",
        ]);

        await user.click(subDropdown); // Reopen sub dropdown

        // Nekomata sub
        await selectOption(0);
        await user.click(storageDropdown);

        options = await screen.findAllByRole("option");

        expect(options.length).toEqual(2);
        expect(options.map((option) => option.textContent)).toEqual([
            "storageD",
            "storageE",
        ]);
    });

    test("bad subscription shows error", async () => {
        const subService: FakeSubscriptionService = inject(
            DependencyName.SubscriptionService
        );

        // Add a bad subscription
        const fakeSet = new BasicFakeSet();
        fakeSet.putSubscription({
            id: "/fake/badsub",
            subscriptionId: "badsub",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "Bad Subscription",
            state: "PastDue",
            authorizationSource: "RoleBased",
            subscriptionPolicies: {
                locationPlacementId: "Fake_Placement_Id",
                quotaId: "Fake_Quota_Id",
            },
        });
        subService.setFakes(fakeSet);

        render(
            <>
                <SubscriptionDropdown param={subParam} />
                <StorageAccountDropdown param={storageParam} />
            </>
        );
        const subDropdown = screen.getByRole("combobox", {
            name: /subId/,
        });
        const storageDropdown = screen.getByRole("combobox", {
            name: /storageAccountId/,
        });
        await user.click(subDropdown);
        await waitFor(() => {
            expectElementEnabled(subDropdown);
            expectElementEnabled(storageDropdown);
        });

        // Bad subscription
        await selectOption(0);
        expect(screen.getByText("Bad Subscription")).toBeDefined();

        await user.click(storageDropdown);
        await act(async () => {
            // Need to run with force so that errors are displayed (this acts
            // like an on-submit validation)
            await form.validate({ force: true });
        });

        expect(await screen.queryAllByRole("option")).toEqual([]);
        expect(
            screen.getByText(
                "Error loading storage accounts: Fake network error"
            )
        ).toBeDefined();
    });

    const expectElementEnabled = (element: HTMLElement) =>
        expect(element.className).not.toContain("is-disabled");

    const selectOption = async (index: number) =>
        await user.click(screen.getAllByRole("option")[index]);
});
