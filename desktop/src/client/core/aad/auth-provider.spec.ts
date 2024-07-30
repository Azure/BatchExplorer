import { instrumentAuthProvider, instrumentForAuth, MockAuthorizeError } from "test/utils/mocks/auth";
import AuthProvider from "./auth-provider";
import { AuthObserver } from "./auth-observer";

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

        const call = async () => await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant1",
        });
        const clientSpy = createClientSpy();
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

        const result1 = await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant1"
        });

        const result2 = await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant2",
        });

        expect(result1.accessToken).toEqual("tenant1-token");
        expect(result2.accessToken).toEqual("tenant2-token");
    });

    describe("AuthProvider.getToken() auth failures", () => {
        beforeEach(() => createClientSpy());
        const retryableErrorCodes = [
            "16000", "16001", "50013", "50027", "50050", "50056", "50058",
            "50061", "50064", "50071", "50072", "50074", "50076", "50079",
            "50085", "50089", "50097", "50125", "50126", "54005", "65004",
            "70008", "700084", "70019", "90012", "90013", null,
            "16000 50071", // Two retryable error codes
        ];
        retryableErrorCodes.forEach(code => {
            it(`should retry on error code ${code}`, async () => {
                authObserver.fetchAuthCode.and.returnValues(
                    Promise.reject(new MockAuthorizeError({
                        error: "Retryable error",
                        errorCodes: [code]
                    })),

                    // Second attempt after retry
                    Promise.resolve(mockAuthCode)
                );
                await expectAsync(authProvider.getToken({
                    tenantId: "tenant1",
                    resourceURI: "resourceURI1",
                })).toBeResolved();
            });
        });

        const unretryableAuthCodeErrors = [
            "1000000", "1000031", "100007", "120012", "120013", "120014",
            "120015", "120016", "120021", "130004", "130005", "130006",
            "130007", "130008", "135010", "135011", "16003", "20001", "20012",
            "20033", "220450", "220501", "221000", "240001", "240002", "28002",
            "28003", "40008", "50002", "50002", "500021", "50005", "50007",
            "50008", "50011", "50014", "50020", "50029", "50034", "50042",
            "50043", "50048", "50049", "50053", "50055", "50057", "50059",
            "50086", "50105", "50107", "501241", "50128", "50129", "50131",
            "50132", "50133", "50134", "50135", "50140", "50143", "50144",
            "50146", "50196", "51000", "51001", "51004", "53000", "53001",
            "53002", "53003", "530032", "53011", "54000", "65005", "650052",
            "650054", "650056", "650057", "67003", "700005", "70001",
            "7000112", "7000114", "700016", "70002", "7000215", "700022",
            "7000222", "700023", "70003", "700030", "70004", "70005", "700054",
            "70007", "70011", "70018", "75003", "7500514", "7500529", "750054",
            "75011", "75016", "80001", "80010", "80012", "80013", "81005",
            "81006", "81007", "81009", "81010", "81011", "81012", "90002",
            "90004", "90005", "90007", "90009", "90010", "9001023", "900144",
            "90015", "90016", "90019", "90020", "90022", "90027", "90036",
            "90038", "900382", "90043", "900432", "90051", "90055", "90056",
            "90072", "90081", "90082", "90084", "90085", "90092", "90093",
            "90094", "90095", "900971", "90099", "901002", "90107", "90123",
            "90124", "90125", "90126", "90130",
            "90094 50133", // Two unretryable error codes
            "50071 50133", // One retryable, one not
        ];

        unretryableAuthCodeErrors.forEach(code =>
            it(`should not retry on error code ${code}`, async () => {
                authObserver.fetchAuthCode.and.returnValue(
                    Promise.reject(new MockAuthorizeError({
                        error: "Unretryable error",
                        errorCodes: [code]
                    }))
                );
                await expectAsync(authProvider.getToken({
                    tenantId: "tenant1",
                    resourceURI: "resourceURI1",
                })).toBeRejected();
            })
        );
    });

    it("shouldn't fail with non-auth exception", async () => {
        createClientSpy();
        authObserver.fetchAuthCode.and.returnValues(
            Promise.reject(new Error("Non-auth error")),
            Promise.resolve(mockAuthCode)
        );

        try {
            await authProvider.getToken({
                tenantId: "tenant1",
                resourceURI: "resourceURI1",
            });
        } catch (e) {
            fail(`Should not have thrown error: ${e}`);
        }
    });

    it("should use external browser when externalBrowserAuth is true", async () => {
        createClientSpy();
        authObserver.selectUserAuthMethod.and.returnValue(
            Promise.resolve({ externalBrowserAuth: true })
        );

        const browserSpy =
            spyOn<any>(authProvider, "_createExternalBrowserRequest");
        await authProvider.getToken({
            resourceURI: "resourceURI1",
            tenantId: "tenant1",
        });
        expect(browserSpy).toHaveBeenCalled();
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
        getTokenCache: makeTokenCacheSpy()
    }
);

const returnToken = (spy, token) => spy.and.returnValue({
    accessToken: token,
    account: "some-account"
});
