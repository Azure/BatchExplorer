import { AuthenticationResult, ClientApplication, InteractionRequiredAuthError } from "@azure/msal-node";
import { AzurePublic } from "client/azure-environment";
import { AuthorizeError, AuthorizeResponseError } from "client/core/aad";
import { AADConfig } from "client/core/aad/aad-config";
import { AuthObserver } from "client/core/aad/auth-observer";
import AuthProvider from "client/core/aad/auth-provider";

export class MockAuthProvider extends AuthProvider {
    public fakeToken: Partial<AuthenticationResult>;
    public fakeConfig: AADConfig;
    public fakeError: Partial<AuthorizeError>;
    public fakeAuthObserver: jasmine.SpyObj<AuthObserver>;
    constructor(app: any, config: AADConfig) {
        instrumentForAuth(app);
        super(app, config);
        this.fakeConfig = config;
        spyOn<any>(this, "_getClient").and.returnValue(
            Promise.resolve(new MockClientApplication(this))
        );
        instrumentAuthProvider(this);
        this.fakeAuthObserver = mockAuthObserver();
        this.setAuthObserver(this.fakeAuthObserver);
    }
}
export class MockClientApplication extends ClientApplication {
    constructor(public fakeAuthProvider?: MockAuthProvider) {
        super({
            auth: {
                clientId: fakeAuthProvider?.fakeConfig.clientId
            }
        });
    }

    public getAuthCodeUrl(request) {
        if (request?.prompt === "none") {
            return Promise.reject(new AuthorizeError({
                error: "fakeError",
                error_description: "fakeErrorDescription",
                error_code: ""
            }));
        }
        return Promise.resolve("https://login.contoso.net?fakeauthcode=12345");
    }

    public acquireTokenByCode() {
        if (this.fakeAuthProvider.fakeError) {
            return Promise.reject(this.fakeAuthProvider.fakeError);
        }
        return Promise.resolve(
            this.fakeAuthProvider.fakeToken as AuthenticationResult);
    }

    public async acquireTokenSilent(): Promise<AuthenticationResult> {
        throw new InteractionRequiredAuthError("Fake interaction required auth error");
    }
}

function mockAuthObserver(): jasmine.SpyObj<AuthObserver> {
    return {
        onAuthFailure: jasmine.createSpy("onAuthFailure"),
        selectUserAuthMethod: jasmine.createSpy("selectUserAuthMethod")
            .and.returnValue(Promise.resolve({ externalBrowserAuth: false })),
        fetchAuthCode: jasmine.createSpy("fetchAuthCode")
    };
}

export class MockAuthorizeError extends AuthorizeError {
    static responseErrorPrototype: AuthorizeResponseError = {
        error: "error",
        error_description: "description"
    };

    constructor(options: Partial<AuthorizeError>) {
        const error = Object.assign(MockAuthorizeError.responseErrorPrototype,
            { error: options.error });
        super(error);
        for (const opt in options) {
            this[opt] = options[opt];
        }
    }
}

export const createMockClientApplication = () => {
    const fakeAuthProvider = new MockAuthProvider({}, {
        tenant: null,
        clientId: null,
        redirectUri: null,
    });
    return new MockClientApplication(fakeAuthProvider);
};

export const instrumentForAuth = app => {
    app.injector = {
        get: () => jasmine.createSpyObj("DataStore", ["getItem", "setItem"])
    };
    app.properties = { azureEnvironment: AzurePublic };
};

export const instrumentAuthProvider = (authProvider: AuthProvider) => {
    const tenants = {};
    spyOn<any>(authProvider, "_getAccount").and.callFake(tenantId => {
        if (tenantId in tenants) {
            return {
                tenantId,
                localAccountId: `${tenantId}-account1`
            };
        } else {
            tenants[tenantId] = true;
            throw new Error("no account");
        }
    });
};
