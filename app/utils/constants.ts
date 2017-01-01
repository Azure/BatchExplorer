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
    BadRequest = 500,
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
