/**
 * Shared access policy for the request to generate a SAS token.
 * Note that the definition is in PascalCase.
 */

export interface SharedAccessPolicy {
    /**
     * Optional signed identifier.
     */
    Id?: string;

    /**
     * Access policy with any permissions and start and expiry time.
     */
    AccessPolicy: AccessPolicy;
}

export interface AccessPolicy {
    /**
     * The permission type
     */
    Permissions: string;

    /**
     * The time at which the Shared Access Signature becomes valid (The UTC value will be used).
     */
    Start?: Date;

    /**
     * The time at which the Shared Access Signature becomes expired (The UTC value will be used).
     */
    Expiry?: Date;

    /**
     * An IP address or a range of IP addresses from which to accept requests. When specifying a range, note
     * that the range is inclusive.
     */
    IPAddressOrRange?: string;

    /**
     * The protocol permitted for a request made with the SAS.
     */
    Protocols?: string;

    /**
     * The services (blob, file, queue, table) for a shared access signature associated with this shared
     * access policy.
     */
    Services?: string;

    /**
     * The resource type for a shared access signature associated with this shared access policy.
     */
    ResourceTypes?: string;
}
