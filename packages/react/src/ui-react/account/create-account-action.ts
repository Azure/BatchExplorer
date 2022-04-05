import { createForm, Form } from "@batch/ui-common";
import { AbstractAction } from "@batch/ui-common/lib/action";
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
    tags?: Record<string, string>;
};

export class CreateAccountAction extends AbstractAction<CreateAccountFormValues> {
    buildForm(): Form<CreateAccountFormValues> {
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
            label: "Pool allocation mode",
        });
        advancedSection.param(
            "allowedAuthenticationModes",
            ParameterType.StringList,
            {
                label: "Authentication modes",
            }
        );

        const tagsSection = form.section("Tags");
        tagsSection.param("tags", ParameterType.Tags, {
            hideLabel: true,
        });

        return form;
    }

    async onValidate(): Promise<void> {
        return super.validate();
    }

    async execute(formValues: CreateAccountFormValues): Promise<void> {
        alert("Would write form values: " + formValues);
    }
}
