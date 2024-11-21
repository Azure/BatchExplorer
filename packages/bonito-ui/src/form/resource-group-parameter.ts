import { ResourceGroup, ResourceGroupService } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import {
    AbstractParameter,
    FormValues,
    ParameterDependencies,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";

export type ResourceGroupDependencies<V extends FormValues> =
    ParameterDependencies<V, "subscriptionId">;

/**
 * A parameter with a resource group ARM resource ID as its value.
 */
export class ResourceGroupParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ResourceGroupDependencies<V>,
> extends AbstractParameter<V, K, D> {
    resourceGroupService: ResourceGroupService = inject(
        DependencyName.ResourceGroupService
    );

    loadError: string | undefined = undefined;

    validateSync(): ValidationStatus {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (this.loadError) {
            return new ValidationStatus(
                "error",
                `Error loading resource groups: ${this.loadError}`
            );
        }
        if (this.value != null && typeof this.value !== "string") {
            return new ValidationStatus("error", "Invalid resource group ID");
        }
        return new ValidationStatus("ok");
    }

    async loadResourceGroups(): Promise<ResourceGroup[]> {
        const subId = this.getSubscriptionId();
        let resourceGroups: ResourceGroup[] = [];
        if (subId) {
            try {
                resourceGroups =
                    await this.resourceGroupService.listBySubscriptionId(subId);
                this.loadError = undefined;
            } catch (e) {
                if (e instanceof Error) {
                    this.loadError = e.message;
                } else {
                    this.loadError = String(e);
                }
            }
        }
        return resourceGroups;
    }

    getSubscriptionId(): string | undefined {
        return this.getDependencyValueAsString("subscriptionId");
    }
}
