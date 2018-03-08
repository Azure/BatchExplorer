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

export function authorizeUrl(aadUrl: string, tenant: string, params: AuthorizeUrlParams) {
    const query = objectToParams(params);
    return `${aadUrl}${tenant}/oauth2/authorize?${query}`;
}

export function logoutUrl(aadUrl: string, tenant: string) {
    return `${aadUrl}${tenant}/oauth2/logout`;
}

export function objectToParams(object): string {
    return Object.keys(object).map((key) => {
        return `${encodeURIComponent(key)}=${object[key]}`;
    }).join("&");
}
