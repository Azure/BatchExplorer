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
    Conflict = 409,
    BadRequest = 500,
};

export const FileUrlStrings = {
    Job: "jobs",
    Pool: "pools",
    Separator: "/",
};

export const FileSourceTypes = {
    Job: "job",
    Pool: "pool",
};

export const forms = {
    validation: {
        maxLength: {
            id: 64,
            displayName: 1024,
        },
        regex: {
            id: "^[\\w\\_-]+$",
        },
        range: {
            retry: { min: -1, max: 100 },
            priority: { min: -1000, max: 1000 },
        },
    },
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
};

export const sessionStorageKey = {
    /**
     * Sessionstorage key that save the last breadcrumb.
     */
    breadcrumb: "breadcrumb",
};

export const ApiVersion = {
    arm: "2016-09-01",
    armBatch: "2015-12-01",
};

export const ExternalLinks = {
    supportRequest: "https://ms.portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade/newsupportrequest",
};
