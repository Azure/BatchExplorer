import { ClientApplication } from "@azure/msal-node";
import { AADConfig } from "client/core/aad/aad-config";
import AuthProvider from "client/core/aad/auth-provider";

export class MockAuthProvider extends AuthProvider {
    public fakeToken: any;
    public fakeConfig: any;
    public fakeError: any;
    constructor(app: any, config: AADConfig) {
        super(app, config);
        this.fakeConfig = config;
        this._getClient = jasmine.createSpy("_getClient").and.returnValue(
            new MockClientApplication(this)
        );
    }
}

export class MockClientApplication extends ClientApplication {
    constructor(private fakeAuthProvider: MockAuthProvider) {
        super({
            auth: {
                clientId: fakeAuthProvider.fakeConfig.clientId
            }
        });
    }

    public getAuthCodeUrl() {
        return Promise.resolve(this.fakeAuthProvider.fakeConfig.redirectUri);
    }

    public acquireTokenByCode(request) {
        if (this.fakeAuthProvider.fakeError) {
            return Promise.reject(this.fakeAuthProvider.fakeError);
        }
        return Promise.resolve(this.fakeAuthProvider.fakeToken);
    }

}
