import { Subscription, SubscriptionService } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import {
    AbstractParameter,
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";

/**
 * A parameter with a subscription ID (the GUID only, not the ARM resource ID
 * starting with "/subscriptions") as its value.
 */
export class SubscriptionParameter<
    V extends FormValues,
    K extends ParameterName<V>,
> extends AbstractParameter<V, K> {
    subscriptionService: SubscriptionService = inject(
        DependencyName.SubscriptionService
    );

    subscriptionLoadError: string | undefined = undefined;

    validateSync(): ValidationStatus {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (this.value != null) {
            if (typeof this.value !== "string") {
                return new ValidationStatus(
                    "error",
                    "Subscription ID must be a string"
                );
            }
            if (this.value.startsWith("/subscriptions/")) {
                return new ValidationStatus(
                    "error",
                    "Subscription ID must be a GUID, not an ARM resource ID"
                );
            }
        }
        return new ValidationStatus("ok");
    }

    async loadSubscriptions(): Promise<Subscription[]> {
        let subs: Subscription[] = [];
        try {
            subs = await this.subscriptionService.list();
            this.subscriptionLoadError = undefined;
        } catch (e) {
            if (e instanceof Error) {
                this.subscriptionLoadError = e.message;
            } else {
                this.subscriptionLoadError = String(e);
            }
        }
        return subs;
    }
}
