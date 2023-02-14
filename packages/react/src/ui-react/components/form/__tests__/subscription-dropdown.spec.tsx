import { createForm, Form } from "@batch/ui-common/lib/form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import * as React from "react";
import { initMockBrowserEnvironment } from "../../../environment";
import { SubscriptionParameter } from "../../../form";
import { runAxe } from "../../../test-util/a11y";
import { SubscriptionDropdown } from "../subscription-dropdown";

type FakeFormValues = {
    subscriptionId?: string;
};

describe("Subscription dropdown tests", () => {
    let user: UserEvent;
    let form: Form<FakeFormValues>;
    let subParam: SubscriptionParameter<FakeFormValues, "subscriptionId">;

    beforeEach(() => {
        initMockBrowserEnvironment();
        user = userEvent.setup();
        form = createForm<FakeFormValues>({ values: {} });
        subParam = form.param("subscriptionId", SubscriptionParameter);
    });

    test("dropdown is accessible", async () => {
        const { container } = render(<SubscriptionDropdown param={subParam} />);

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

    test("dropdown options", async () => {
        render(<SubscriptionDropdown param={subParam} />);
        const element = screen.getByRole("combobox");
        await user.click(element);
        await waitFor(() => expect(element).not.toContain("is-disabled"));
        const options = screen.getAllByRole("option");
        expect(options.length).toEqual(2);
        expect(options.map((option) => option.textContent)).toEqual([
            // Sorted alphabetically
            "nekomata",
            "tanuki",
        ]);
    });
});
