export interface AADUser {
    /**
     * Audience
     * Identifies the application that is using the token to access a resource.
     * The application can act as itself or on behalf of a user.
     * The application ID typically represents an application object,
     * but it can also represent a service principal object in Azure AD.
     * @example "https://contoso.com"
     */
    aud?: string;

    /**
     * Issuer
     * Identifies the security token service (STS) that constructs and returns the token.
     * In the tokens that Azure AD returns, the issuer is sts.windows.net.
     * The GUID in the Issuer claim value is the tenant ID of the Azure AD directory.
     * The tenant ID is an immutable and reliable identifier of the directory.
     */
    iss?: string;

    /**
     * IssuedAt
     * Stores the time at which the token was issued. It is often used to measure token freshness.
     */
    iat?: number;

    /**
     * #Token lifetime#
     * Defines the time interval within which a token is valid.
     * The service that validates the token should verify that the current date
     * is within the token lifetime, else it should reject the token.
     * The service might allow for up to five minutes beyond the token lifetime range
     * to account for any differences in clock time ("time skew") between Azure AD and the service.
     */
    nbf?: number;

    /**
     * @see nbf
     */
    exp?: number;

    /**
     * Authentication Method
     * Identifies how the subject of the token was authenticated.
     */
    amr?: string[];

    /**
     * Last name of user
     */
    family_name?: string;

    /**
     * First name of user
     */
    given_name: string;
    ipaddr: string;

    /**
     *  User name
     */
    name: string;
    nonce?: string;

    /**
     * Object id
     * Contains a unique identifier of an object in Azure AD.
     * This value is immutable and cannot be reassigned or reused.
     */
    oid?: string;
    platf?: string;
    sub?: string;
    tid?: string;

    /**
     * Unique name
     * Provides a human readable value that identifies the subject of the token.
     * This value is not guaranteed to be unique within a tenant and is designed to be used only for display purposes.
     */
    unique_name: string;

    /**
     * User principal name
     * Stores the user name of the user principal.
     * @example "frankm@contoso.com"
     */
    upn?: string;

    /**
     * Version
     * @example 1.0
     */
    ver?: string;
}
