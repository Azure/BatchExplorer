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
