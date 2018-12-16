// tslint:disable:variable-name

export enum MouseButton {
    left = 0,
    middle = 1,
    right = 2,
}

export enum HttpCode {
    Ok = 200,
    Accepted = 201,
    NotFound = 404,
    BadRequest = 400,
    Forbidden = 403,
    RequestTimeout = 408,
    Conflict = 409,
    UnprocessableEntity = 422,
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

export const DataStoreKeys = {
    /**
     * LocalStorage key for storing the access token (For AAD request)
     */
    currentAccessToken: "current_access_token",

    /**
     * LocalStorage key for storing the current selected workspace ID
     */
    selectedWorkspaceId: "selected-workspace-id",
};
