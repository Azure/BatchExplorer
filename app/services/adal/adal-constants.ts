export const baseUrl = "https://login.microsoftonline.com";
export const defaultTenant = "common";

export interface AuthorizeUrlParams {
    response_type: string;
    redirect_uri: string;
    client_id: string;
    scope: string;
    nonce?: string;
    state?: string;
    resource?: string;
    prompt?: string;
}

export interface TokenUrlParams {
    code: string;
    client_id: string;
    redirect_uri: string;
    grant_type: string;
}

export interface LogoutParams {
    post_logout_redirect_uri?: string;
}
export function authorizeUrl(tenant: string, params: AuthorizeUrlParams) {
    const query = objectToParams(params);
    return `${baseUrl}/${tenant}/oauth2/authorize?${query}`;
}

export function logoutUrl(tenant: string, params: LogoutParams) {
    const query = objectToParams(params);
    return `${baseUrl}/${tenant}/oauth2/logout?${query}`;
}

export function objectToParams(object): string {
    return Object.keys(object).map((key) => {
        return `${encodeURIComponent(key)}=${object[key]}`;
    }).join("&");
}
