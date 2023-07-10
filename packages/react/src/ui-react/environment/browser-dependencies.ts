import { DependencyFactories } from "@batch/ui-common/lib/environment";
import { StorageAccountService, SubscriptionService } from "@batch/ui-service";
import { ResourceGroupService } from "@batch/ui-service/lib/resource-group";
import { LocationService } from "@batch/ui-service/lib/location";
import { FormControlResolver, FormLayoutProvider } from "../components/form";

export enum BrowserDependencyName {
    FormControlResolver = "formControlResolver",
    FormLayoutProvider = "formLayoutProvider",
    LocationService = "locationService",
    ResourceGroupService = "resourceGroupService",
    StorageAccountService = "storageAccountService",
    SubscriptionService = "subscriptionService",
}

export interface BrowserDependencyFactories extends DependencyFactories {
    [BrowserDependencyName.FormControlResolver]: () => FormControlResolver;
    [BrowserDependencyName.FormLayoutProvider]: () => FormLayoutProvider;
    [BrowserDependencyName.LocationService]: () => LocationService;
    [BrowserDependencyName.ResourceGroupService]: () => ResourceGroupService;
    [BrowserDependencyName.StorageAccountService]: () => StorageAccountService;
    [BrowserDependencyName.SubscriptionService]: () => SubscriptionService;
}