/**
 * HTTP request methods
 */
export enum HttpRequestMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Delete = "DELETE",
    Patch = "PATCH",
    Head = "HEAD",
    Connect = "CONNECT",
    Options = "OPTIONS",
    Trace = "TRACE",
}

/**
 * Standard HTTP headers
 */
export enum StandardHttpHeaders {
    CacheControl = "Cache-Control",
    ContentType = "Content-Type",
}

/**
 * Non-standard HTTP headers
 */
export enum CustomHttpHeaders {
    CommandName = "x-ms-command-name",
}

/**
 * HTTP media types (aka MIME types)
 */
export enum MediaType {
    Json = "application/json",
    JsonOData = "application/json; odata=minimalmetadata; charset=UTF-8",
}

/**
 * Cache control directives (for use with the Cache-Control header)
 */
export enum CacheControl {
    NoCache = "no-cache",
}
