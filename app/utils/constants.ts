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
};

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
    Storage: "storage",
};

export const forms = {
    validation: {
        maxLength: {
            id: 64,
            displayName: 1024,
            applicationName: 64,
            version: 64,
        },
        regex: {
            id: /^[\w\_-]+$/i,
            appVersion: /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/i,
            appFilename: /\.zip$/i,
        },
        range: {
            retry: { min: -1, max: 100 },
            priority: { min: -1000, max: 1000 },
        },
    },
};

export const SavedDataFilename = {
    sshPublicKeys: "ssh-pub-keys.json",
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
     * Subscriptions cached
     */
    subscriptions: "subscriptions",

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
    armBatch: "2015-12-01",
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
};

export const APIErrorCodes = {
    containerNotFound: "ContainerNotFound",
    operationInvalidForCurrentState: "OperationInvalidForCurrentState",
};
