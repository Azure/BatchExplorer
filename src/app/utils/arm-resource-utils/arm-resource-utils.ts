import { log, SanitizedError } from "@batch-flask/utils";
import { ResourceDescriptor } from "app/models";
import { Constants, providersApiVersion } from "common/constants";

export class InvalidArmResourceIdError extends Error {

}
/* eslint-disable max-len */
/**
 * Class for parsing and testing Batch and ARM resource ID's.
 * From: MsPortalFx.ViewModels.Services.ResourceTypes.ts
 */
export class ArmResourceUtils {

    /**
     * Parse the arm resource id uri to retrieve the subscription id inside.
     * This could also be used for any arm url depending on subscriptions
     *
     * @param id Arm resource id
     */
    public static getSubscriptionIdFromResourceId(id: string): string | null {
        if (!id) { return null; }

        const regex = /subscriptions\/(.*)\/resourcegroups/i;
        const out = regex.exec(id.toLowerCase());

        if (!out || out.length < 2) {
            return null;
        } else {
            return out[1];
        }
    }

    /**
     * Parse the arm resource id uri to retrieve the subscription id inside.
     * This could also be used for any arm url depending on subscriptions
     *
     * @param id Arm resource id
     */
    public static getResourceGroupFromResourceId(id: string): string | undefined | null {
        if (!id) { return null; }
        try {
            return this._resourceDescriptorParser(id).resourceGroup;
        } catch (e) {
            log.error("Failed to extract resource group from resource Id", { id });
            return null;
        }
    }

    /*
     * Returns the account name from a resource id
     */
    public static getAccountNameFromResourceId(id: string): string | null {
        if (!id) { return null; }
        try {
            return this._resourceDescriptorParser(id).resource;
        } catch (e) {
            log.error("Failed to extract account name from resource Id", { id });
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

    public static getApiVersionForUri(uri: string): string {
        const providerSpecific = /.*\/providers\/([a-zA-Z.]*)\/([a-zA-Z.]*)/i;
        const match = providerSpecific.exec(uri);
        if (match && match.length > 1) {
            const provider = match[1].toLowerCase();
            const resource = `${provider}/${match[2].toLowerCase()}`;
            if (resource in providersApiVersion) {
                return providersApiVersion[resource];
            } else if (provider in providersApiVersion) {
                return providersApiVersion[provider];
            } else {
                throw new SanitizedError(`Unkown provider '${provider}'`);
            }
        }
        return Constants.ApiVersion.arm;
    }

    // - matches (/{type}/{instance})+
    private static regExpResourceTypeExtractor = /\/([^\/]+)\/([^\/]+)/ig;

    // - matches (/something/something)* + /providers/{provider} + (/{type}/{instance})+
    private static regExpProviderExtractor = /(?!(?:\/[^\/]+\/[^\/]+)+\/providers)\/providers\/([^\/]+)((:?\/[^\/]+\/[^\/]+)*)$/i;

    // - matches /subscriptions/{subscriptionId} + (/resourcegroups/{resourcegroup})?
    private static regExpSubscriptionAndResourceGroupExtractor = /\/subscriptions\/([^\/\s]+)(?:\/resourcegroups\/([^\/\s]+))?/i;

    // - matches (/subscriptions/{subscriptionId}/resourcegroups/{resourcegroup})? + /providers + (/something/something)+
    private static regExpResourceId = /^(?:\/cloudname\/[^\/\s]+)?(?:\/subscriptions\/[^\/\s]+(\/resourcegroups\/[^\/\s]+)?)?(?:\/providers\/[^\/]+(?:\/[^\/]+\/[^\/]+)*)*(?!(?:\/[^\/]+\/[^\/]+)+\/providers)\/providers\/([^\/]+)((?:\/[^\/]+\/[^\/]+)+)$/i;

    // - matches exactly /subscriptions/{subscriptionId}
    private static regExpSubscriptionId = /^\/subscriptions\/([^\/\s]+)$/i;

    // - matches exactly /subscriptions/{subscriptionId}/resourcegroups/{resourcegroup}
    private static regExpResourceGroupId = /^\/subscriptions\/([^\/\s]+)\/resourcegroups\/([^\/\s]+)$/i;

    /**
     * Parse a resource ID into a ResourceDescriptor object with all the parts split out.
     *
     * @param id: Batch or ARM resource ID
     */
    private static _resourceDescriptorParser(id: string): ResourceDescriptor {
        if (!this.isResourceId(id)) {
            throw new InvalidArmResourceIdError("Invalid resource id: " + id);
        }

        // extract the subscription id and resource group id, if available.
        let tokens = ArmResourceUtils.regExpSubscriptionAndResourceGroupExtractor.exec(id);

        const result = new ResourceDescriptor();
        result.subscription = tokens && tokens[1] || undefined;
        result.resourceGroup = tokens && tokens[2] || undefined;

        // prefix all ids with '/providers/Microsoft.Resources'. This allows us to generically look
        // for the last '/providers' token and whatever follows (the resources) in any type of resource.
        id = "/providers/Microsoft.Resources" + id;

        // extract the provider and resources. produces [ id, provider, resources ]
        tokens = ArmResourceUtils.regExpProviderExtractor.exec(id);
        if (!tokens) {
            throw new InvalidArmResourceIdError("Invalid resource id: " + id);
        }

        result.provider = tokens[1];
        const resources = tokens[2];

        // extract all resource types and instances.
        let partialType = result.provider;
        result.type = undefined;
        result.types = [];
        result.resource = null;
        result.resources = [];
        result.resourceMap = {};

        // eslint-disable-next-line
        while (tokens = ArmResourceUtils.regExpResourceTypeExtractor.exec(resources)) {
            if (!tokens) {
                throw new InvalidArmResourceIdError("Invalid resource id: " + id);
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
