/* A set of AAD error codes that indicate that auth cannot be retried via
 * interactive login.
 *
 * Non-retryable error codes result in the tenant considered unauthorized.
 *
 * Based on codes in
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
 */
export const unretryableAuthCodeErrors = [
    "1000000", // UserNotBoundError
    "1000031", // Application cannot be accessed
    "100007", // Unsupported auth (AAD Regional ONLY)
    "120012", // PasswordChangeNeedsToHappenOnPrem
    "120013", // PasswordChangeOnPremisesConnectivityFailure
    "120014", // PasswordChangeOnPremUserAccountLockedOutOrDisabled
    "120015", // PasswordChangeADAdminActionRequired
    "120016", // PasswordChangeUserNotFoundBySspr
    "120021", // PartnerServiceSsprInternalServiceError
    "130004", // NgcKeyNotFound
    "130005", // NgcInvalidSignature
    "130006", // NgcTransportKeyNotFound
    "130007", // NgcDeviceIsDisabled
    "130008", // NgcDeviceIsNotFound
    "135010", // KeyNotFound
    "135011", // Device used during the authentication is disabled
    "16003", // SsoUserAccountNotFoundInResourceTenant
    "20001", // WsFedSignInResponseError
    "20012", // WsFedMessageInvalid
    "20033", // FedMetadataInvalidTenantName
    "220450", // UnsupportedAndroidWebViewVersion
    "220501", // InvalidCrlDownload
    "221000", // DeviceOnlyTokensNotSupportedByResource
    "240001", // BulkAADJTokenUnauthorized
    "240002", // RequiredClaimIsMissing
    "28002", // Provided value for '{scope}' is not valid
    "28003", // Provided value for '{scope}' is empty
    "40008", // OAuth2IdPUnretryableServerError
    "50002", // NotAllowedTenant
    "50002", // NotAllowedTenant
    "500021", // Access to '{tenant}' tenant is denied
    "50005", // DevicePolicyError
    "50007", // PartnerEncryptionCertificateMissing
    "50008", // InvalidSAMLToken
    "50011", // InvalidReplyTo
    "50014", // GuestUserInPendingState
    "50020", // UserUnauthorized
    "50029", // Invalid URI
    "50034", // UserAccountNotFound
    "50042", // UnableToGeneratePairwiseIdentifierWithMissingSalt
    "50043", // UnableToGeneratePairwiseIdentifierWithMultipleSalts
    "50048", // SubjectMismatchesIssuer
    "50049", // NoSuchInstanceForDiscovery
    "50053", // IdsBlocked or sign-in was blocked for malicious IP
    "50055", // InvalidPasswordExpiredPassword
    "50057", // UserDisabled
    "50059", // MissingTenantRealmAndNoUserInformationProvided
    "50086", // SasNonRetryableError
    "50105", // EntitlementGrantsNotFound
    "50107", // InvalidRealmUri
    "501241", // Mandatory Input '{paramName}' missing from '{transformId}'
    "50128", // Invalid domain name
    "50129", // DeviceIsNotWorkplaceJoined
    "50131", // ConditionalAccessFailed
    "50132", // SsoArtifactInvalidOrExpired
    "50133", // SsoArtifactRevoked
    "50134", // DeviceFlowAuthorizeWrongDatacenter
    "50135", // PasswordChangeCompromisedPassword
    "50140", // KmsiInterrupt
    "50143", // Session mismatch
    "50144", // InvalidPasswordExpiredOnPremPassword
    "50146", // MissingCustomSigningKey
    "50196", // LoopDetected
    "51000", // RequiredFeatureNotEnabled
    "51001", // DomainHintMustbePresent
    "51004", // UserAccountNotInDirectory
    "53000", // DeviceNotCompliant
    "53001", // DeviceNotDomainJoined
    "53002", // ApplicationUsedIsNotAnApprovedApp
    "53003", // BlockedByConditionalAccess
    "530032", // BlockedByConditionalAccessOnSecurityPolicy
    "53011", // User blocked due to risk on home tenant.
    "54000", // MinorUserBlockedLegalAgeGroupRule
    "65005", // MisconfiguredApplication
    "650052", // The app needs access to service
    "650054", // Request permissions for resource that is no longer available
    "650056", // Misconfigured application
    "650057", // Invalid resource
    "67003", // ActorNotValidServiceIdentity
    "700005", // InvalidGrantRedeemAgainstWrongTenant
    "70001", // UnauthorizedClient
    "7000112", // UnauthorizedClientApplicationDisabled
    "7000114", // Application not allowed to make on-behalf-of calls.
    "700016", // UnauthorizedClient_DoesNotMatchRequest
    "70002", // InvalidClient
    "7000215", // Invalid client secret is provided
    "700022", // InvalidMultipleResourcesScope
    "7000222", // InvalidClientSecretExpiredKeysProvided
    "700023", // InvalidResourcelessScope
    "70003", // UnsupportedGrantType
    "700030", // Invalid certificate
    "70004", // InvalidRedirectUri
    "70005", // UnsupportedResponseType
    "700054", // Response_type 'id_token' is not enabled
    "70007", // UnsupportedResponseMode
    "70011", // InvalidScope
    "70018", // BadVerificationCode
    "75003", // UnsupportedBindingError
    "7500514", // Unsupported SAML response type
    "7500529", // The value ‘SAMLId-Guid’ is not a valid SAML ID
    "750054", // SAMLRequest or SAMLResponse must be present
    "75011", // NoMatchedAuthnContextInOutputClaims
    "75016", // Saml2AuthenticationRequestInvalidNameIDPolicy
    "80001", // OnPremiseStoreIsNotAvailable
    "80010", // OnPremisePasswordValidationEncryptionException
    "80012", // OnPremisePasswordValidationAccountLogonInvalidHours
    "80013", // OnPremisePasswordValidationTimeSkew
    "81005", // DesktopSsoAuthenticationPackageNotSupported
    "81006", // DesktopSsoNoAuthorizationHeader
    "81007", // DesktopSsoTenantIsNotOptIn
    "81009", // DesktopSsoAuthorizationHeaderValueWithBadFormat
    "81010", // DesktopSsoAuthTokenInvalid
    "81011", // DesktopSsoLookupUserBySidFailed
    "81012", // DesktopSsoMismatchBetweenTokenUpnAndChosenUpn
    "90002", // InvalidTenantName
    "90004", // InvalidRequestFormat
    "90005", // InvalidRequestWithMultipleRequirements
    "90007", // InvalidSessionId
    "90009", // TokenForItselfMissingIdenticalAppIdentifier
    "90010", // NotSupported
    "9001023", // Grant type unsupported over /common or /consumers
    "900144", // The request body must contain '{name}' parameter
    "90015", // QueryStringTooLong
    "90016", // MissingRequiredClaim
    "90019", // MissingTenantRealm
    "90020", // SAML 1.1 Assertion is missing user's ImmutableID
    "90022", // AuthenticatedInvalidPrincipalNameFormat
    "90027", // Cannot issue tokens from API version on MSA tenant
    "90036", // MsodsServiceUnretryableFailure
    "90038", // NationalCloudTenantRedirection
    "900382", // Confidential Client is not supported in Cross Cloud request
    "90043", // NationalCloudAuthCodeRedirection
    "900432", // Confidential Client is not supported in Cross Cloud request
    "90051", // InvalidNationalCloudId
    "90055", // TenantThrottlingError (blocked tenant)
    "90056", // BadResourceRequest
    "90072", // PassThroughUserMfaError
    "90081", // OrgIdWsFederationMessageInvalid
    "90082", // OrgIdWsFederationNotSupported
    "90084", // OrgIdWsFederationGuestNotAllowed
    "90085", // OrgIdWsFederationSltRedemptionFailed
    "90092", // GraphNonRetryableError
    "90093", // GraphUserUnauthorized
    "90094", // AdminConsentRequired
    "90095", // AdminConsentRequiredRequestAccess
    "900971", // No reply address provided
    "90099", // The application has not been authorized in the tenant
    "901002", // 'resource' request parameter is not supported
    "90107", // InvalidXml
    "90123", // IdentityProviderAccessDenied
    "90124", // V1ResourceV2GlobalEndpointNotSupported
    "90125", // DebugModeEnrollTenantNotFound
    "90126", // DebugModeEnrollTenantNotInferred
    "90130", // NonConvergedAppV2GlobalEndpointNotSupported
];

