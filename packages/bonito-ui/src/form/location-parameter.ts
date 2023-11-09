import { Location, LocationService } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import {
    AbstractParameter,
    FormValues,
    ParameterDependencies,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";

export type LocationDependencies<V extends FormValues> = ParameterDependencies<
    V,
    "subscriptionId"
>;

/**
 * A parameter with a location ARM resource ID as its value.
 */
export class LocationParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends LocationDependencies<V>
> extends AbstractParameter<V, K, D> {
    locationService: LocationService = inject(DependencyName.LocationService);

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
                `Error loading locations: ${this.loadError}`
            );
        }
        if (this.value != null && typeof this.value !== "string") {
            return new ValidationStatus("error", "Invalid location ID");
        }
        return new ValidationStatus("ok");
    }

    async loadLocations(): Promise<Location[]> {
        const subId = this.getSubscriptionId();
        let locations: Location[] = [];
        if (subId) {
            try {
                locations = await this.locationService.listBySubscriptionId(
                    subId
                );
                this.loadError = undefined;
            } catch (e) {
                if (e instanceof Error) {
                    this.loadError = e.message;
                } else {
                    this.loadError = String(e);
                }
            }
        }
        return locations;
    }

    getSubscriptionId(): string | undefined {
        return this.getDependencyValueAsString("subscriptionId");
    }
}
