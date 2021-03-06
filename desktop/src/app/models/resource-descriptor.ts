/**
 * The subscription descriptor represents a subscription ID in part form.
 */
export class SubscriptionDescriptor {
    /**
     * The subscription ID for the resource group.
     */
    public subscription: string | undefined | null;
}

/**
 * The resource group descriptor represents a resource group ID in part form.
 */
export class ResourceGroupDescriptor extends SubscriptionDescriptor {
    /**
     * The resource group name for the resource group.
     */
    public resourceGroup: string | undefined | null;
}

/**
 * The resource descriptor represents a resource ID in part form.
 */
export class ResourceDescriptor extends ResourceGroupDescriptor {
    /**
     * The provider name for the resource.
     */
    public provider: string | null;

    /**
     * The type for the resource (this is the most nested type).
     */
    public type: string | undefined | null;

    /**
     * The resource name for the resource.
     */
    public resource: string | null;

    /**
     * The collection of types for the resource (from left-to-right from the URI).
     * This will have more than one item for nested resources, one for each level of nesting.
     */
    public types: string[] = [];

    /**
     * The collection of resource names for the resource (from left-to-right from the URI).
     * This will have more than one item for nested resources, one for each level of nesting.
     */
    public resources: string[] = [];

    /**
     * The resource map maps a partial type to a resource name.
     * For the resource ID:
     *  - /subscriptions/sub123/resourcegroups/rg123/providers/prov123/type1/resource1/type2/resource2/type3/resource3
     * the map includes:
     * "prov123/type1" => resource1
     * "prov123/type1/type2" => resource2
     * "prov123/type1/type2/type3" => resource3
     */
    public resourceMap: StringMap<string> = {};
}
