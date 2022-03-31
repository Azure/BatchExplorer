import { createForm } from "@batch/ui-common";
import { ParameterType } from "../components/form";

export type CreateAccountFormValues = {
    accountName?: string;
    subscriptionId?: string;
    resourceGroupId?: string;
    location?: string;
    storageAccountId?: string;
    identityType?: string;
    publicNetworkAccess?: string;
    poolAllocationMode?: string;
    allowedAuthenticationModes?: string[];
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

createAccountForm.param("storageAccountId", ParameterType.StorageAccountId, {
    label: "Location",
});

const advancedSection = createAccountForm.section("Advanced");

advancedSection.param("identityType", ParameterType.String, {
    label: "Identity type",
});

advancedSection.param("publicNetworkAccess", ParameterType.String, {
    label: "Public network access",
});

advancedSection.param("poolAllocationMode", ParameterType.String, {
    label: "Pool alocation mode",
});

advancedSection.param("allowedAuthenticationModes", ParameterType.StringList, {
    label: "Authentication modes",
});

createAccountForm.section("Tags");

createAccountForm.section("Review + Create");
