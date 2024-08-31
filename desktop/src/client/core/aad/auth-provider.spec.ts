import { instrumentAuthProvider, instrumentForAuth } from "test/utils/mocks/auth";
import AuthProvider from "./auth-provider";
import { AuthObserver } from "./auth-observer";
import { PublicClientApplication } from "@azure/msal-node";

const FAKE_GET_TOKEN_ARGS = {
    resourceURI: "resourceURI1",
    tenantId: "tenant1"
};

describe("AuthProvider", () => {
    let authProvider: AuthProvider;
    const appSpy: any = {
        properties: {
            azureEnvironment: {
                aadUrl: "my-URL",
                arm: "my-arm",
                batch: "my-batch"
            }
        }
    };
    let mockAuthCode;
    let authObserver: jasmine.SpyObj<AuthObserver>;
    let clientSpy: jasmine.SpyObj<PublicClientApplication>;

    instrumentForAuth(appSpy);
    const config: any = {
        tenant: "common",
        redirectUri: "my-redirect-uri",
        clientId: "my-client-id"
    };

    beforeEach(() => {
        authProvider = new AuthProvider(appSpy, config);
        authObserver = {
            selectUserAuthMethod: jasmine.createSpy("selectUserAuthMethod")
                .and.returnValue(Promise.resolve({ externalBrowserAuth: false })),
            onAuthFailure: jasmine.createSpy("mock-auth-failure"),
            fetchAuthCode: jasmine.createSpy("fetchAuthCode")
        };
        authProvider.setAuthObserver(authObserver);
        mockAuthCode = "some-code";
    });

    it("authenticates interactively first, then silently", async () => {
        authObserver.fetchAuthCode.and.returnValue(Promise.resolve(mockAuthCode));

        const call = async () => await authProvider.getToken(FAKE_GET_TOKEN_ARGS);
        clientSpy = createClientSpy();
        instrumentAuthProvider(authProvider);

        returnToken(clientSpy.acquireTokenSilent, "silent-token-1");

        const result1 = await call();
        expect(clientSpy.getAuthCodeUrl).toHaveBeenCalled();
        expect(clientSpy.acquireTokenByCode).toHaveBeenCalled();
        expect(clientSpy.acquireTokenSilent).not.toHaveBeenCalled();
        expect(result1.accessToken).toEqual("tenant1-token");

        clientSpy.getAuthCodeUrl.calls.reset();
        clientSpy.acquireTokenByCode.calls.reset();

        const result2 = await call();
        expect(clientSpy.getAuthCodeUrl).not.toHaveBeenCalled();
        expect(clientSpy.acquireTokenByCode).not.toHaveBeenCalled();
        expect(clientSpy.acquireTokenSilent).toHaveBeenCalled();
        expect(result2.accessToken).toEqual("silent-token-1");
    });

    it("should return a per-tenant access token", async () => {
        createClientSpy();

        const result1 = await authProvider.getToken(FAKE_GET_TOKEN_ARGS);

        const result2 = await authProvider.getToken({
            ...FAKE_GET_TOKEN_ARGS,
            tenantId: "tenant2",
        });

        expect(result1.accessToken).toEqual("tenant1-token");
        expect(result2.accessToken).toEqual("tenant2-token");
    });

    describe("#_externalBrowserAuth", () => {
        beforeEach(() => {
            clientSpy = createClientSpy();
            authObserver.selectUserAuthMethod.and.returnValue(
                Promise.resolve({ externalBrowserAuth: true })
            );
        });
        it("is called when externalBrowserAuth is true", async () => {
            const browserSpy =
                spyOn<any>(authProvider, "_createExternalBrowserRequest");
            await authProvider.getToken(FAKE_GET_TOKEN_ARGS);
            expect(browserSpy).toHaveBeenCalled();
        });
        it("handles error thrown by _createExternalBrowserRequest()", async () => {
            const err = "fake external browser error";
            spyOn<any>(authProvider, "_createExternalBrowserRequest")
                .and.returnValue(Promise.reject(err));
            await expectAsync(authProvider.getToken(FAKE_GET_TOKEN_ARGS))
                .toBeRejectedWith(err);
            expect(authObserver.onAuthFailure).toHaveBeenCalledWith(err);
        });
        it("calls acquireTokenInteractive() with select_account prompt", async () => {
            await authProvider.getToken(FAKE_GET_TOKEN_ARGS);
            expect(clientSpy.acquireTokenInteractive).toHaveBeenCalledWith(
                jasmine.objectContaining({ prompt: "select_account" }));
        });
    });

    describe("#_builtInWindowAuth", () => {
        beforeEach(() => {
            clientSpy = createClientSpy();
            authObserver.selectUserAuthMethod.and.returnValue(
                Promise.resolve({ externalBrowserAuth: false })
            );
        });
        it("is called when externalBrowserAuth is false", async () => {
            await authProvider.getToken(FAKE_GET_TOKEN_ARGS);
            expect(clientSpy.getAuthCodeUrl).toHaveBeenCalled();
            expect(authObserver.fetchAuthCode).toHaveBeenCalled();
            expect(clientSpy.acquireTokenByCode).toHaveBeenCalled();
        });
        it("handles error thrown by client.getAuthCodeUrl()", async () => {
            const err = "fake getAuthCodeUrl error";
            clientSpy.getAuthCodeUrl.and.returnValue(Promise.reject(err));
            await expectAsync(authProvider.getToken(FAKE_GET_TOKEN_ARGS))
                .toBeRejectedWith(err);
            expect(authObserver.onAuthFailure).toHaveBeenCalledWith(err);
            expect(clientSpy.acquireTokenByCode).not.toHaveBeenCalled();
            expect(authObserver.fetchAuthCode).not.toHaveBeenCalled();
        });
        it("handles error thrown by fetchAuthCode()", async () => {
            const err = "fake fetchAuthCode error";
            authObserver.fetchAuthCode.and.returnValue(Promise.reject(err));
            await expectAsync(authProvider.getToken(FAKE_GET_TOKEN_ARGS))
                .toBeRejectedWith(err);
            expect(clientSpy.getAuthCodeUrl).toHaveBeenCalled();
            expect(authObserver.onAuthFailure).toHaveBeenCalledWith(err);
            expect(clientSpy.acquireTokenByCode).not.toHaveBeenCalled();
        });
    });

    function createClientSpy() {
        const spy = makeClientApplicationSpy();
        spyOn<any>(authProvider, "_createClient").and.callFake(tenantId => {
            returnToken(spy.acquireTokenByCode, `${tenantId}-token`);
            return spy;
        });
        return spy;
    }
});

const makeTokenCacheSpy = () => jasmine.createSpyObj(
    "TokenCache", {
        getAllAccounts: [],
        remove: jasmine.anything
    }
);

const makeClientApplicationSpy = () => jasmine.createSpyObj(
    "ClientApplication", {
        acquireTokenSilent: jasmine.anything,
        getAuthCodeUrl: jasmine.anything,
        acquireTokenByCode: jasmine.anything,
        getTokenCache: makeTokenCacheSpy(),
        acquireTokenInteractive: jasmine.anything
    }
);

const returnToken = (spy, token) => spy.and.returnValue({
    accessToken: token,
    account: "some-account"
});
