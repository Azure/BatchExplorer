import { Duration } from "luxon";

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

// export const MaxDurations = {
//     maxDays: 10675199,
//     maxHours: 256204776,
//     maxMinutes: 15372286560,
//     maxSeconds: 922337193600,
// };

// // server returns "P10675199DT2H48M5.4775807S" for unlimited duration
export const MaxDurationValue = Duration.fromObject({
    days: 10675199,
    hours: 2,
    minutes: 48,
    seconds: 5.4775807,
});
