// tslint:disable:variable-name

export const caching = {
    /**
     * Max number of filtered query that it should remember.
     * It will always keep the query for no query and that last n queries with a filter
     */
    maxQuery: 1,
    /**
     * Max number of cache a targeted cache would keep at the same time
     */
    maxTargetedCache: 2,
};

export enum HttpCode {
    Ok = 200,
    Accepted = 201,
    NotFound = 404,
    BadRequest = 400,
    RequestTimeout = 408,
    Conflict = 409,
    InteralServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

export const RetryableHttpCode = new Set([
    HttpCode.RequestTimeout,
    HttpCode.InteralServerError,
    HttpCode.BadGateway,
    HttpCode.ServiceUnavailable,
    HttpCode.GatewayTimeout,
]);

export const badHttpCodeMaxRetryCount = 5;

export const FileUrlStrings = {
    Job: "jobs",
    Pool: "pools",
    Separator: "/",
};

export const FileSourceTypes = {
    Job: "job",
    Pool: "pool",
    Blob: "blob",
};

export const forms = {
    validation: {
        maxLength: {
            id: 64,
            displayName: 1024,
            applicationName: 64,
            version: 64,
            fileGroup: 63,
        },
        regex: {
            id: /^[\w\_-]+$/i,
            appVersion: /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/i,
            appFilename: /\.zip$/i,
            fileGroup: /^[a-z0-9]([a-z0-9]|-(?!-|\z))*$/,
        },
        range: {
            retry: { min: -1, max: 100 },
            priority: { min: -1000, max: 1000 },
        },
    },
};

export const SavedDataFilename = {
    sshPublicKeys: "ssh-pub-keys.json",
    autosacleFormula: "autoscale-formula.json",
};

export const localStorageKey = {
    /**
     * LocalStorage key for storing the current user information
     */
    currentUser: "current_user",

    /**
     * LocalStorage key for storing the access token(For AAD request)
     */
    currentAccessToken: "current_access_token",

    /**
     * List of subsciption id to the multi select in the account list
     */
    accountSubscriptionFilter: "account_subscription_filter",

    /**
     * Subscriptions cached
     */
    subscriptions: "subscriptions",

    /**
     * Subscriptions cached
     */
    batchAccounts: "batchAccounts",

    /**
     * Last batch account selected.
     */
    selectedAccountId: "selected-account-id",
};

export const sessionStorageKey = {
    /**
     * Sessionstorage key that save the last breadcrumb.
     */
    breadcrumb: "breadcrumb",
};

export const ApiVersion = {
    arm: "2016-09-01",
    armClassicStorage: "2016-11-01",
    armStorage: "2016-12-01",
    armBatch: "2017-05-01",
    compute: "2017-03-30",
    commerce: "2016-08-31-preview",
};

export const ExternalLinks = {
    supportRequest: "https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade/newsupportrequest",
    setupStorageAccount: "https://portal.azure.com/#resource{0}/storageAccount",
};

export const ODataFields = {
    state: "state",
    taskExitCode: "executionInfo/exitCode",
};

export const Environment = {
    prod: "production" as Environment,
    dev: "developement" as Environment,
    test: "test" as Environment,
};

export const ServiceUrl = {
    arm: "https://management.azure.com",
    githubRaw: "https://raw.githubusercontent.com",
    appInsights: "https://api.applicationinsights.io/v1",
};

export const ResourceUrl = {
    batch: "https://batch.core.windows.net/",
    arm: "https://management.core.windows.net/",
    appInsights: "https://api.applicationinsights.io",
};

export const APIErrorCodes = {
    containerNotFound: "ContainerNotFound",
    operationInvalidForCurrentState: "OperationInvalidForCurrentState",
    authenticationFailed: "AuthenticationFailed",
    accountNotEnabledForAutoStorage: "AccountNotEnabledForAutoStorage",
};

export const MetadataInternalKey = {
    tags: "_bl_tags",
};

export const PollRate = {
    entity: 10000,
    batchApplication: 60000,
};

/**
 * Maximum number of tasks the recent tasks attribute can have.
 */
export const nodeRecentTaskLimit = 10;

export const LowPriDiscount = {
    windows: 0.40, // 60%
    linux: 0.20,   // 80%
};

export enum MouseButton {
    left = 0,
    middle = 1,
    right = 2,
}

export const AAD = {
    /**
     * Minimum number of milliseconds the token should have left before we refresh
     * 2 minutes
     */
    refreshMargin: 1000 * 120,
    defaultResource: ResourceUrl.arm,
};

export const customProtocolName = "ms-batchlabs";

/**
 * Name of events that needs to be passed between rendered and main
 */
export const rendererEvents = {
    batchlabsLink: "batchlabs-link",
};
