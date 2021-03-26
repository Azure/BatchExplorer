import { AuthenticationResult, ClientApplication } from "@azure/msal-node";
import { AuthorizeError } from "client/core/aad";
import { AADConfig } from "client/core/aad/aad-config";
import AuthProvider from "client/core/aad/auth-provider";

export class MockAuthProvider extends AuthProvider {
    public fakeToken: Partial<AuthenticationResult>;
    public fakeConfig: AADConfig;
    public fakeError: Partial<AuthorizeError>;
    constructor(app: any, config: AADConfig) {
        super(app, config);
        this.fakeConfig = config;
        this._getClient = jasmine.createSpy("_getClient").and.returnValue(
            new MockClientApplication(this)
        );
    }
}
export class MockClientApplication extends ClientApplication {
    constructor(public fakeAuthProvider: MockAuthProvider) {
        super({
            auth: {
                clientId: fakeAuthProvider.fakeConfig.clientId
            }
        });
    }

    public getAuthCodeUrl(request) {
        if (request?.prompt === "none") {
            throw "No silent auth";
        }
        return Promise.resolve(this.fakeAuthProvider.fakeConfig.redirectUri);
    }

    public acquireTokenByCode() {
        if (this.fakeAuthProvider.fakeError) {
            return Promise.reject(this.fakeAuthProvider.fakeError);
        }
        return Promise.resolve(
            this.fakeAuthProvider.fakeToken as AuthenticationResult);
    }

}

export const createMockClientApplication = () => {
    const fakeAuthProvider = new MockAuthProvider({}, {
        tenant: null,
        clientId: null,
        redirectUri: null,
        logoutRedirectUri: null
    });
    return new MockClientApplication(fakeAuthProvider);
};
