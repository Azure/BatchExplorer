import { ResourceDescriptor } from "app/models";
import { log } from "app/utils";

// tslint:disable:max-line-length
/**
 * Class for parsing and testing Batch and ARM resource ID's.
 * From: MsPortalFx.ViewModels.Services.ResourceTypes.ts
 */
export class ArmResourceUtils {
    /*
     * Returns the account name from a resource id
     */
    public static getAccountNameFromResourceId(id: string): string {
        try {
            return this._resourceDescriptorParser(id).resource;
        } catch (e) {
            log.error("Failed to extract account name from accountId", id);
            return null;
        }
    }

    /**
     * Parses a resource ID into a resource descriptor.
     *
     * @param id The resource ID to parse.
     * @return The resource descriptor object.
     */
    public static getResourceDescriptor(id: string): ResourceDescriptor {
        return this._resourceDescriptorParser(id);
    }

    /**
     * Determines if a given ID is a resource ID.
     * Eg: /subscriptions/sub123/resourcegroups/rg123/providers/pro123/type123/res123
     *     /subscriptions/sub123/resourcegroups/rg123/providers/pro123/type123/res123[/type456/res456[/type789/res789[...]]]
     *
     * @param id The ID to check.
     * @return Boolean true if the ID is a resource ID, otherwise false.
     */
    public static isResourceId(id: string): boolean {
        return ArmResourceUtils.regExpResourceId.test(id);
    }

    /**
     * Determines if a given ID is a subscription ID.
     * Eg: /subscriptions/sub123
     *
     * @param id The ID to check.
     * @return Boolean true if the ID is a resource group ID, otherwise false.
     */
    public static isSubscriptionId(id: string): boolean {
        return ArmResourceUtils.regExpSubscriptionId.test(id);
    }

    /**
     * Determines if a given ID is a resource group ID.
     * Eg: /subscriptions/sub123/resourcegroups/rg123
     *
     * @param id The ID to check.
     * @return Boolean true if the ID is a resource group ID, otherwise false.
     */
    public static isResourceGroupId(id: string): boolean {
        return ArmResourceUtils.regExpResourceGroupId.test(id);
    }

    /**
     * Determines if a given ID is a deployment ID.
     * Supports ids of the form:
     * /subscriptions/{subId}/resourceGroups/{rgName}/providers/Microsoft.Resources/deployments/{deploymentName}
     * /subscriptions/{subId}/resourceGroups/{rgName}/deployments/{deploymentName}
     *
     * @param id The ID to check.
     * @return Boolean true if the ID is a deployment ID, otherwise false.
     */
    public static isDeploymentId(id: string): boolean {
        return ArmResourceUtils.regExpDeploymentResourceId.test(id) || ArmResourceUtils.regExpDeploymentId.test(id);
    }

    /**
     * Determines if a given ID is a tag ID.
     *
     * @param id The ID to check.
     * @return Boolean true if the ID is a tag ID, otherwise false.
     */
    public static isTagId(id: string): boolean {
        return ArmResourceUtils.regExpTagId.test(id);
    }

    // - matches (/{type}/{instance})+
    private static regExpResourceTypeExtractor = /\/([^\/]+)\/([^\/]+)/ig;

    // - matches (/something/something)* + /providers/{provider} + (/{type}/{instance})+
    private static regExpProviderExtractor = /(?!(?:\/[^\/]+\/[^\/]+)+\/providers)\/providers\/([^\/]+)((:?\/[^\/]+\/[^\/]+)*)$/i;

    // - matches /subscriptions/{subscriptionId} + (/resourcegroups/{resourcegroup})?
    private static regExpSubscriptionAndResourceGroupExtractor = /\/subscriptions\/([^\/\s]+)(?:\/resourcegroups\/([^\/\s]+))?/i;

    // - matches (/subscriptions/{subscriptionId}/resourcegroups/{resourcegroup})? + /providers + (/something/something)+
    private static regExpResourceId = /^(?:\/cloudname\/[^\/\s]+)?(?:\/subscriptions\/[^\/\s]+(\/resourcegroups\/[^\/\s]+)?)?(?:\/providers\/[^\/]+(?:\/[^\/]+\/[^\/]+)*)*(?!(?:\/[^\/]+\/[^\/]+)+\/providers)\/providers\/([^\/]+)((?:\/[^\/]+\/[^\/]+)+)$/i;

    // - matches /subscriptions/{subscriptionId}/resourcegroups/{resourcegroup}/deployments/{deploymentName}
    private static regExpDeploymentId = /^\/subscriptions\/([^\/\s]+)\/resourcegroups\/([^\/\s]+)\/deployments\/([^\/]+)$/i;

    // - matches /subscriptions/{subscriptionId}/resourcegroups/{resourcegroup}/providers/microsoft.resources/deployments/{deploymentName}
    private static regExpDeploymentResourceId = /^\/subscriptions\/([^\/\s]+)\/resourcegroups\/([^\/\s]+)\/providers\/microsoft.resources\/deployments\/([^\/]+)$/i;

    // - matches /subscriptions/{subscriptionId}/tagNames/{tagName} + (/tagValues/{tagValue}) *
    private static regExpTagId = /^\/subscriptions\/([^\/\s]+)\/tagNames\/([^\/]+)(?:\/tagValues\/([^\/]+))?$/i;

    // - matches exactly /subscriptions/{subscriptionId}
    private static regExpSubscriptionId = /^\/subscriptions\/([^\/\s]+)$/i;

    // - matches exactly /subscriptions/{subscriptionId}/resourcegroups/{resourcegroup}
    private static regExpResourceGroupId = /^\/subscriptions\/([^\/\s]+)\/resourcegroups\/([^\/\s]+)$/i;

    /**
     * Parse a resource ID into a ResourceDescriptor object with all the parts split out.
     * @param id: Batch or ARM resource ID
     */
    private static _resourceDescriptorParser(id: string): ResourceDescriptor {
        if (!this.isResourceId(id)) {
            throw new Error("Invalid resource id: " + id);
        }

        // extract the subscription id and resource group id, if available.
        let tokens = ArmResourceUtils.regExpSubscriptionAndResourceGroupExtractor.exec(id);
        const tokensLength = tokens && tokens.length;

        const result = new ResourceDescriptor();
        result.subscription = tokensLength > 1 && tokens[1] || undefined;
        result.resourceGroup = tokensLength > 2 && tokens[2] || undefined;

        // prefix all ids with '/providers/Microsoft.Resources'. This allows us to generically look
        // for the last '/providers' token and whatever follows (the resources) in any type of resource.
        id = "/providers/Microsoft.Resources" + id;

        // extract the provider and resources. produces [ id, provider, resources ]
        tokens = ArmResourceUtils.regExpProviderExtractor.exec(id);
        if (!tokens) {
            throw new Error("Invalid resource id: " + id);
        }

        result.provider = tokens[1];
        const resources = tokens[2];

        // extract all resource types and instances.
        let partialType = result.provider;
        result.type = undefined;
        result.types = [];
        result.resource = undefined;
        result.resources = [];
        result.resourceMap = {};

        // tslint:disable-next-line
        while (tokens = ArmResourceUtils.regExpResourceTypeExtractor.exec(resources)) {
            if (!tokens) {
                throw new Error("Invalid resource id: " + id);
            }

            result.types.push(tokens[1]);
            result.type = tokens[1]; // Keeps last.

            result.resources.push(tokens[2]);
            result.resource = tokens[2]; // Keeps last.

            partialType += "/" + result.type;
            result.resourceMap[partialType] = result.resource;
        }

        return result;
    }
}
