/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match */

export const badHttpCodeMaxRetryCount = 5;

export const FileSourceTypes = {
    Job: "job",
    Pool: "pool",
    Blob: "blob",
};

export const forms = {
    validation: {
        minLength: {
            container: 3,
        },
        maxLength: {
            id: 64,
            displayName: 1024,
            applicationName: 64,
            version: 64,
            fileGroup: 55,
            container: 63,
        },
        regex: {
            id: /^[\w\_-]+$/i,
            appVersion: /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/i,
            appFilename: /\.zip$/i,
            certificateFileName: /(\.pfx|\.cer)$/i,
            fileGroup: /^(?!.*--)[a-z0-9-]+$/,
            batchAccount: /^[0-9a-z]*$/,
        },
        range: {
            retry: { min: -1, max: 100 },
            priority: { min: -1000, max: 1000 },
        },
    },
};

export const SavedDataFilename = {
    sshPublicKeys: "data/ssh-pub-keys.json",
};

export const UserSpecificStoreKeys = {
    accountFavorites: "account-favorites",
};

export const localStorageKey = {
    /**
     * LocalStorage key for storing the current user information
     */
    currentUser: "current_user",

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

    /**
     * Where the proxy settings are stored
     */
    proxySettings: "proxy_settings",

    /**
     * Save the latest azure environemnt used
     */
    azureEnvironment: "azure_environment",

    /**
     * Last selected storage account
     */
    lastStorageAccount: "last_storage_account",

    /**
     * Telemetry enabled
     */
    telemetryEnabled: "telemetry_enabled",

    /**
     * Save a randomly generated machine id
     */
    machineId: "machine_id",

    nodeConnectLastSSHPublicKey: "node-connect.last-ssh-public-key",
};

export const ApiVersion = {
    arm: "2020-01-01",
    armClassicStorage: "2016-11-01",
    armStorage: "2016-12-01",
    armBatch: "2019-08-01",
    compute: {
        default: "2019-03-01",
        skus: "2019-04-01",
    },
    commerce: "2016-08-31-preview",
    authorization: "2017-05-01",
    monitor: "2017-05-01-preview",
    network: "2017-10-01",
    classicNetwork: "2015-12-01",
    consumption: "2018-10-01",
    batchService: "2023-05-01.17.0",
    costManagement: "2019-01-01",
};

export const providersApiVersion: { [resourceProvider: string]: string } = {
    "microsoft.batch": ApiVersion.armBatch,
    "microsoft.classicstorage": ApiVersion.armClassicStorage,
    "microsoft.storage": ApiVersion.armStorage,
    "microsoft.compute": ApiVersion.compute.default,
    "microsoft.compute/skus": ApiVersion.compute.skus,
    "microsoft.commerce": ApiVersion.commerce,
    "microsoft.authorization": ApiVersion.authorization,
    "microsoft.insights": ApiVersion.monitor,
    "microsoft.network": ApiVersion.network,
    "microsoft.classicnetwork": ApiVersion.classicNetwork,
    "microsoft.consumption": ApiVersion.consumption,
    "microsoft.costmanagement": ApiVersion.costManagement,
};

export const ExternalLinks = {
    supportRequest: "https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade/newsupportrequest",
    setupStorageAccount: "https://portal.azure.com/#resource{0}/storageAccount",
    license: "https://azure.github.io/BatchExplorer/EULA.html",
    privacyStatement: "https://privacy.microsoft.com/en-us/privacystatement",
    italyAccessibility: "https://www.microsoft.com/it-it/accessibility/accessibilita/dichiarazioni",
    submitIssue: "https://github.com/Azure/BatchExplorer/issues",
    subscriptionUrl: "https://portal.azure.com/#resource/subscriptions/{0}/overview",
    costManagementUrl: "https://ms.portal.azure.com/#resource/subscriptions/{0}/costByResource",
    resourceGroupUrl: "https://portal.azure.com/#resource/subscriptions/{0}/resourceGroups/{1}/overview",
};

export const ODataFields = {
    state: "state",
    result: "executionInfo/result",
    taskExitCode: "executionInfo/exitCode",
};

export const Environment = {
    prod: "production" as Environment,
    dev: "developement" as Environment,
    test: "test" as Environment,
};

export const ServiceUrl = {
    githubRaw: "https://raw.githubusercontent.com",
    github: "https://github.com",
};

export const ResourceUrl = {
    batch: "https://batch.core.windows.net/",
    arm: "https://management.core.windows.net/",
    appInsights: "https://api.applicationinsights.io",
    msGraph: "https://graph.microsoft.com",
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

export const AAD = {
    /**
     * Minimum number of milliseconds the token should have left before we refresh
     * 2 minutes
     */
    refreshMargin: 1000 * 120,
};

export const IpcEvent = {
    AAD: {
        accessTokenData: "AAD_ACCESS_TOKEN_DATA",
        clearTenantAuth: "AAD_CLEAR_TENANT_AUTH"
    },
    launchApplication: "LAUNCH_APPLICATION",
    login: "LOGIN",
    logout: "LOGOUT",
    userAuthSelectRequest: "USER_AUTH_SELECT",
    userAuthSelectResponse:
        (requestId: string) => `USER_AUTH_SELECT_${requestId}`,
    sendTelemetry: "SEND_TELEMETRY",
    log: "SEND_LOG",
    storageBlob: {
        listContainers: "STORAGE_BLOB_LIST_CONTAINERS",
        getContainerProperties: "STORAGE_BLOB_GET_CONTAINER_PROPERTIES",
        deleteContainer: "STORAGE_BLOB_GET_DELETE_CONTAINER",
        createContainer: "STORAGE_BLOB_CREATE_CONTAINER",

        listBlobs: "STORAGE_BLOB_LIST_BLOBS",
        getBlobProperties: "STORAGE_BLOB_GET_BLOB_PROPERTIES",
        getBlobContent: "STORAGE_BLOB_GET_BLOB_CONTENT",
        generateSasUrl: "STORAGE_BLOB_GENERATE_SAS_URL",
        downloadBlob: "STORAGE_BLOB_DOWNLOAD_BLOB",
        uploadFile: "STORAGE_BLOB_UPLOAD_FILE",
        deleteBlob: "STORAGE_BLOB_DELETE_BLOB",
    }
};

export const ExternalApplication = {
    terminal: "TERMINAL",
};

export const legacyProtocolName = "ms-batchlabs";
export const customProtocolName = "ms-batch-explorer";

/**
 * Name of events that needs to be passed between rendered and main
 */
export const rendererEvents = {
    batchExplorerLink: "batchExplorer-link",
    navigateTo: "navigate-to",
};

export const isRenderer = (process && process.type === "renderer");

export const legacyFileGroupPrefix = "fgrp-";

export const ListPageSizes = {
    default: 50,
};

export const KnownQueryParameters = {
    useAutoPool: "auto-pool",
    inputParameter: "input-parameter",
    assetContainer: "asset-container",
    assetPaths: "asset-paths",
    outputs: "outputs",
};

const cdn = "https://batchexplorer.azureedge.net";

export const AutoUpdateUrls = {
    stable: `${cdn}/stable`,
    insider: `${cdn}/insider`,
    testing: `${cdn}/test`,
};

/**
 * All telemetry event should be here to keep track of it
 */
export const TelemetryEvents = {
    applicationStart: "Application start",
    disableTelemetry: "Disable telemetry",
};
