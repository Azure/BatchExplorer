import { AuthenticationResult, ClientApplication } from "@azure/msal-node";
import { AzurePublic } from "client/azure-environment";
import { AuthorizeError } from "client/core/aad";
import { AADConfig } from "client/core/aad/aad-config";
import AuthProvider from "client/core/aad/auth-provider";

export class MockAuthProvider extends AuthProvider {
    public fakeToken: Partial<AuthenticationResult>;
    public fakeConfig: AADConfig;
    public fakeError: Partial<AuthorizeError>;
    constructor(app: any, config: AADConfig) {
        instrumentForAuth(app);
        super(app, config);
        this.fakeConfig = config;
        spyOn<any>(this, "_getClient").and.returnValue(
            new MockClientApplication(this)
        );
        instrumentAuthProvider(this);
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
            throw new Error("No silent auth");
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

export const instrumentForAuth = app => {
    app.injector = {
        get: () => jasmine.createSpyObj("DataStore", ["getItem", "setItem"])
    };
    app.properties = { azureEnvironment: AzurePublic }
}

export const instrumentAuthProvider = (authProvider: AuthProvider) => {
    const tenants = {};
    spyOn<any>(authProvider, "_getAccount").and.callFake(tenantId => {
        if (tenantId in tenants) {
            return { tenantId };
        } else {
            tenants[tenantId] = true;
            throw new Error("no account");
        }
    });
}
