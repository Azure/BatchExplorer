export interface UserAuthSelection {
    externalBrowserAuth?: boolean;
}

export interface AuthObserver {
    onAuthFailure(error);
    selectUserAuthMethod(tenantId: string): Promise<UserAuthSelection>;
    fetchAuthCode(url: string, tenantId: string): Promise<string>;
}
