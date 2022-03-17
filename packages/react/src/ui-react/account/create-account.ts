import { createForm } from "@batch/ui-common";
import { ParameterType } from "../components/form";

export type CreateAccountFormValues = {
    accountName?: string;
    subscriptionId?: string;
    resourceGroupId?: string;
    location?: string;
};

export const createAccountForm = createForm<CreateAccountFormValues>({
    title: "Create Account",
    values: {},
});

createAccountForm.param("subscriptionId", ParameterType.SubscriptionId, {
    label: "Subscription",
});

createAccountForm.param("resourceGroupId", ParameterType.ResourceGroupId, {
    label: "Resource group",
});

createAccountForm.param("accountName", ParameterType.BatchAccountName, {
    label: "Account name",
    description:
        "This is how you identify your Batch account. It must be unique.",
});

createAccountForm.param("location", ParameterType.LocationId, {
    label: "Location",
});

createAccountForm.section("Tags");

createAccountForm.section("Review + Create");
