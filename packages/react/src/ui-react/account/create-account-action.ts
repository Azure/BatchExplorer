import { createForm, Form } from "@batch/ui-common";
import { FormValues } from "@batch/ui-common/lib/form";
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

// TODO: Make this a public interface and put it in the common package
//       Still needs to support validation, action execution.
interface Action<V extends FormValues> {
    createForm(): Form<V>;
}

export class CreateAccountAction implements Action<CreateAccountFormValues> {
    createForm(): Form<CreateAccountFormValues> {
        const form = createForm<CreateAccountFormValues>({
            title: "Create Account",
            values: {},
        });
        form.param("subscriptionId", ParameterType.SubscriptionId, {
            label: "Subscription",
        });
        form.param("resourceGroupId", ParameterType.ResourceGroupId, {
            label: "Resource group",
        });
        form.param("accountName", ParameterType.BatchAccountName, {
            label: "Account name",
            description:
                "This is how you identify your Batch account. It must be unique.",
        });
        form.param("location", ParameterType.LocationId, {
            label: "Location",
        });
        form.param("storageAccountId", ParameterType.StorageAccountId, {
            label: "Storage account",
            description:
                "Optional. For best performance we recommend a storage account (general purpose v2) located in the same region as the associated Batch account.",
        });

        const advancedSection = form.section("Advanced");
        advancedSection.param("identityType", ParameterType.String, {
            label: "Identity type",
        });
        advancedSection.param("publicNetworkAccess", ParameterType.String, {
            label: "Public network access",
        });
        advancedSection.param("poolAllocationMode", ParameterType.String, {
            label: "Pool alocation mode",
        });
        advancedSection.param(
            "allowedAuthenticationModes",
            ParameterType.StringList,
            {
                label: "Authentication modes",
            }
        );

        form.section("Tags");

        form.section("Review + Create");

        return form;
    }
}
