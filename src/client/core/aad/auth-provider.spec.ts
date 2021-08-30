import { instrumentAuthProvider, instrumentForAuth } from "test/utils/mocks/auth";
import AuthProvider from "./auth-provider";

describe("AuthProvider", () => {
    let authProvider: AuthProvider;
    const authCodeCallbackSpy = jasmine.createSpy("authCodeCallback")
        .and.returnValue("some-code");
    const appSpy: any = {
        properties: {
            azureEnvironment: {
                aadUrl: "my-URL",
                arm: "my-arm",
                batch: "my-batch"
            }
        }
    };
    instrumentForAuth(appSpy);
    const config: any = {
        tenant: "common",
        redirectUri: "my-redirect-uri",
        clientId: "my-client-id"
    };

    beforeEach(() => {
        authProvider = new AuthProvider(appSpy, config);
    });

    it("authenticates interactively first, then silently", async () => {
        const call = async () => await authProvider.getToken({
            resourceURI: "resourceURI1", tenantId: "tenant1",
            authCodeCallback: authCodeCallbackSpy
        });
        const clientSpy = makeClientApplicationSpy();
        spyOn<any>(authProvider, "_getClient").and.returnValue(clientSpy);
        instrumentAuthProvider(authProvider);

        returnToken(clientSpy.acquireTokenByCode, "interactive-token-1");
        returnToken(clientSpy.acquireTokenSilent, "silent-token-1");

        const result1 = await call();
        expect(authCodeCallbackSpy).toHaveBeenCalled();
        expect(clientSpy.getAuthCodeUrl).toHaveBeenCalled();
        expect(clientSpy.acquireTokenByCode).toHaveBeenCalled();
        expect(clientSpy.acquireTokenSilent).not.toHaveBeenCalled();
        expect(result1.accessToken).toEqual("interactive-token-1");

        clientSpy.getAuthCodeUrl.calls.reset();
        clientSpy.acquireTokenByCode.calls.reset();
        authCodeCallbackSpy.calls.reset();

        const result2 = await call();
        expect(authCodeCallbackSpy).not.toHaveBeenCalled();
        expect(clientSpy.getAuthCodeUrl).not.toHaveBeenCalled();
        expect(clientSpy.acquireTokenByCode).not.toHaveBeenCalled();
        expect(clientSpy.acquireTokenSilent).toHaveBeenCalled();
        expect(result2.accessToken).toEqual("silent-token-1");
    });

    it("should return a per-tenant access token", async () => {
        spyOn<any>(authProvider, "_getClient").and.callFake(tenantId => {
            const spy = makeClientApplicationSpy();
            returnToken(spy.acquireTokenByCode, `${tenantId}-token`);
            return spy;
        });

        const result1 = await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant1",
            authCodeCallback: authCodeCallbackSpy
        });

        const result2 = await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant2",
            authCodeCallback: authCodeCallbackSpy
        });

        expect(result1.accessToken).toEqual("tenant1-token");
        expect(result2.accessToken).toEqual("tenant2-token");
    });
});

const makeClientApplicationSpy = () => jasmine.createSpyObj(
    "ClientApplication", [
        "acquireTokenSilent", "getAuthCodeUrl", "acquireTokenByCode"
    ]);

const returnToken = (spy, token) => spy.and.returnValue({
    accessToken: token,
    account: "some-account"
});
