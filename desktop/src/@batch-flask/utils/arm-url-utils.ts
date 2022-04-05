import { UrlOrRequestType } from "@batch/ui-common/lib-cjs/http";

const SUBSCRIPTION_REGEX = new RegExp("/subscriptions/([a-f0-9\-]{36,})", "i");

/**
 * Gets the subscription ID from the provided URL
 */
export function getSubscriptionIdFromUrl(urlOrRequest: UrlOrRequestType):
string | null {
    if (!urlOrRequest) { return null; }
    const url = urlFor(urlOrRequest);
    if (!url) { return null; }
    const matches = url.match(SUBSCRIPTION_REGEX);
    return matches ? matches[1] : null;
}

export function urlFor(urlOrRequest: UrlOrRequestType): string {
    if (typeof urlOrRequest === "string") {
        return urlOrRequest;
    }
    return urlOrRequest.url;
}
