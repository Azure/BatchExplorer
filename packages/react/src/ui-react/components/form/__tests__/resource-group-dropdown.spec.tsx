import { inject } from "@batch/ui-common/lib/environment";
import { createForm, Form } from "@batch/ui-common/lib/form";
import { FakeSubscriptionService } from "@batch/ui-service";
import { BasicFakeSet } from "@batch/ui-service/lib/test-util/fakes";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import { act } from "react-dom/test-utils";
import {
    BrowserDependencyName,
    initMockBrowserEnvironment,
} from "../../../environment";
import { SubscriptionParameter } from "../../../form";
import {
    ResourceGroupDependencies,
    ResourceGroupParameter,
} from "../../../form/resource-group-parameter";
import { runAxe } from "../../../test-util/a11y";
import { ResourceGroupDropdown } from "../resource-group-dropdown";
import { SubscriptionDropdown } from "../subscription-dropdown";

type FakeFormValues = {
    subId?: string;
    resourceGroupId?: string;
};

describe("Resource group dropdown", () => {
    let user: UserEvent;
    let form: Form<FakeFormValues>;
    let subParam: SubscriptionParameter<FakeFormValues, "subId">;
    let rgParam: ResourceGroupParameter<
        FakeFormValues,
        "resourceGroupId",
        ResourceGroupDependencies<FakeFormValues>
    >;

    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
        form = createForm<FakeFormValues>({ values: {} });
        subParam = form.param("subId", SubscriptionParameter);
        rgParam = form.param("resourceGroupId", ResourceGroupParameter, {
            dependencies: {
                subscriptionId: "subId",
            },
        });
    });

    test("simple dropdown", async () => {
        render(<ResourceGroupDropdown param={rgParam} />);
        const element = screen.getByRole("combobox");
        await user.click(element);
        await waitFor(() => expectElementEnabled(element));
        expect(screen.queryAllByRole("option")).toEqual([]);
    });

    test("dropdown is accessible", async () => {
        const { container } = render(<ResourceGroupDropdown param={rgParam} />);

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
                <ResourceGroupDropdown param={rgParam} />
            </>
        );
        const subDropdown = screen.getByRole("combobox", {
            name: /subId/,
        });
        const rgDropdown = screen.getByRole("combobox", {
            name: /resourceGroupId/,
        });
        await user.click(subDropdown);
        await waitFor(() => {
            expectElementEnabled(subDropdown);
            expectElementEnabled(rgDropdown);
        });

        // Tanuki sub
        await selectOption(1);
        await user.click(rgDropdown);

        let options = await screen.findAllByRole("option");

        expect(options.length).toEqual(2);
        expect(options.map((option) => option.textContent)).toEqual([
            // Sorted alphabetically
            "supercomputing",
            "visualization",
        ]);

        await user.click(subDropdown); // Reopen sub dropdown

        // Nekomata sub
        await selectOption(0);
        await user.click(rgDropdown);

        options = await screen.findAllByRole("option");

        expect(options.length).toEqual(3);
        expect(options.map((option) => option.textContent)).toEqual([
            "production",
            "staging",
            "test",
        ]);
    });

    test("bad subscription shows error", async () => {
        const subService: FakeSubscriptionService = inject(
            BrowserDependencyName.SubscriptionService
        );

        // Add a bad subscription
        const fakeSet = new BasicFakeSet();
        fakeSet.subscriptions["/fake/has_invalid_characters!"] = {
            id: "/fake/has_invalid_characters!",
            subscriptionId: "has_invalid_characters!",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "Bad Subscription",
            state: "PastDue",
            authorizationSource: "RoleBased",
            subscriptionPolicies: {
                locationPlacementId: "Fake_Placement_Id",
                quotaId: "Fake_Quota_Id",
            },
        };
        subService.setFakes(fakeSet);

        render(
            <>
                <SubscriptionDropdown param={subParam} />
                <ResourceGroupDropdown param={rgParam} />
            </>
        );
        const subDropdown = screen.getByRole("combobox", {
            name: /subId/,
        });
        const rgDropdown = screen.getByRole("combobox", {
            name: /resourceGroupId/,
        });
        await user.click(subDropdown);
        await waitFor(() => {
            expectElementEnabled(subDropdown);
            expectElementEnabled(rgDropdown);
        });

        // Bad subscription
        await selectOption(0);
        expect(screen.getByText("Bad Subscription")).toBeDefined();

        await user.click(rgDropdown);
        await act(async () => {
            // Need to run with force so that errors are displayed (this acts
            // like an on-submit validation)
            await form.validate({ force: true });
        });

        expect(await screen.queryAllByRole("option")).toEqual([]);
        expect(
            screen.getByText(
                `Error loading resource groups: Invalid subscription ID: "has_invalid_characters!"`
            )
        ).toBeDefined();
    });

    const expectElementEnabled = (element: HTMLElement) =>
        expect(element.className).not.toContain("is-disabled");

    const selectOption = async (index: number) =>
        await user.click(screen.getAllByRole("option")[index]);
});
