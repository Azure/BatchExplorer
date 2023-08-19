import { StorageAccount, StorageAccountService } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import {
    AbstractParameter,
    FormValues,
    ParameterDependencies,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";

export type StorageAccountDependencies<V extends FormValues> =
    ParameterDependencies<V, "subscriptionId">;

/**
 * A parameter with a storage account ARM resource ID as its value.
 */
export class StorageAccountParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends StorageAccountDependencies<V>
> extends AbstractParameter<V, K, D> {
    storageAccountService: StorageAccountService = inject(
        DependencyName.StorageAccountService
    );

    storageAccountLoadError: string | undefined = undefined;

    validateSync(): ValidationStatus {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (this.storageAccountLoadError) {
            return new ValidationStatus(
                "error",
                "Error loading storage accounts: " +
                    this.storageAccountLoadError
            );
        }
        if (this.value != null && typeof this.value !== "string") {
            return new ValidationStatus("error", "Invalid storage account ID");
        }
        return new ValidationStatus("ok");
    }

    async loadStorageAccounts(): Promise<StorageAccount[]> {
        const subId = this.getSubscriptionId();
        let storageAccounts: StorageAccount[] = [];
        if (subId) {
            try {
                storageAccounts =
                    await this.storageAccountService.listBySubscriptionId(
                        subId
                    );
                this.storageAccountLoadError = undefined;
            } catch (e) {
                if (e instanceof Error) {
                    this.storageAccountLoadError = e.message;
                } else {
                    this.storageAccountLoadError = String(e);
                }
            }
        }
        return storageAccounts;
    }

    getSubscriptionId(): string | undefined {
        return this.getDependencyValueAsString("subscriptionId");
    }
}
