import { instrumentAuthProvider, instrumentForAuth, MockAuthorizeError } from "test/utils/mocks/auth";
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
        spyOn<any>(authProvider, "_createClient").and.callFake(tenantId => {
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

    it("should retry interactive auth only for certain error codes",
    async () => {
        spyOn<any>(authProvider, "_createClient").and.callFake(tenantId => {
            const spy = makeClientApplicationSpy();
            returnToken(spy.acquireTokenByCode, `${tenantId}-token`);
            return spy;
        });

        async function expectRetryable(code: string | string[], retryable) {
            const authCodeSpy =
                jasmine.createSpy("authCodeCallback").and.returnValues(
                    Promise.reject(new MockAuthorizeError({
                        error: (retryable ? "Retryable" : "Unretryable") +
                            " error",
                        errorCodes: [].concat(code) // convert scalar or array
                                                    // into flat array
                    })),
                    // Second call for interactive auth
                    jasmine.anything
                );

            try {
                await authProvider.getToken({
                    tenantId: "tenant1",
                    resourceURI: "resourceURI1",
                    authCodeCallback: authCodeSpy
                });
                if (!retryable) {
                    fail(`Should have thrown an error on code ${code}`);
                }
            } catch (e) {
                if (retryable) {
                    fail(`Should not have thrown an error on code ${code}: ` +
                        e);
                }
            }
        }

        await [
            "16000", "16001", "50013", "50027", "50050", "50056", "50058",
            "50061", "50064", "50071", "50072", "50074", "50076", "50079",
            "50085", "50089", "50097", "50125", "50126", "54005", "65004",
            "70008", "700084", "70019", "90012", "90013"
        ].forEach(code => expectRetryable(code, true));

        await [
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
            "90124", "90125", "90126", "90130"
        ].forEach(code => expectRetryable(code, false));

        expectRetryable([], true);
        expectRetryable(["16000", "50071"], true); // Both retryable
        expectRetryable(["90094", "50133"], false); // Both unretryable
        expectRetryable(["50071", "50133"], false); // One retryable, one not

    });
});

const makeTokenCacheSpy = () => jasmine.createSpyObj(
    "TokenCache", {
        getAllAccounts: [],
        remove: jasmine.anything
    }
)

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
