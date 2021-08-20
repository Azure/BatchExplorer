import { delay } from "test/utils/helpers/misc";
import { MockAuthProvider } from "test/utils/mocks/auth";
import { MockAuthenticationWindow, MockSplashScreen } from "test/utils/mocks/windows";
import {
    AuthenticationService, AuthenticationState, AuthorizeError, AuthorizeResult,
} from "./authentication.service";

const CONFIG = {
    tenant: "common",
    clientId: "abc",
    redirectUri: "http://localhost",
    logoutRedirectUri: "http://localhost",
};

describe("AuthenticationService", () => {
    let userAuthorization: AuthenticationService;
    let fakeAuthWindow: MockAuthenticationWindow;
    let fakeAuthProvider: MockAuthProvider;
    let appSpy;
    let state: AuthenticationState;
    beforeEach(() => {
        appSpy = {
            splashScreen: new MockSplashScreen(),
            authenticationWindow: new MockAuthenticationWindow()
        };
        fakeAuthProvider = new MockAuthProvider(appSpy, CONFIG);
        userAuthorization = new AuthenticationService(appSpy, CONFIG,
            fakeAuthProvider);
        fakeAuthWindow = appSpy.authenticationWindow;
        userAuthorization.state.subscribe(x => state = x);
    });

    describe("Authorize", () => {
        let result: AuthorizeResult | null;
        let error: AuthorizeError | null;
        let promise;
        beforeEach(async () => {
            result = null;
            error = null;
            const obs = userAuthorization.authorize("tenant-1");
            promise = obs.then((out) => result = out).catch((e) => error = e);
            await delay();
        });

        it("Should have called loadurl", async () => {
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            await promise;

            expect(fakeAuthWindow.loadURL).toHaveBeenCalledTimes(1);
            const args = fakeAuthWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
        });

        it("window should be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(true);
        });

        it("should return the id token and code when successful", async () => {
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            fakeAuthProvider.fakeToken = { accessToken: "somecode" };
            await promise;
            expect(result).not.toBeNull();
            expect(result.accessToken).toEqual("somecode");
            expect(error).toBeNull();

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(state).toBe(AuthenticationState.Authenticated);
        });

        it("Should error when the window fails to load", async () => {
            fakeAuthWindow.notifyError({ code: 4, description: "Foo bar" });
            await promise;

            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("Failed to authenticate");
            expect(error.description).toEqual("Failed to load the AAD login page (4:Foo bar)");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("Should error when the url redirect returns an error", async () => {
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            fakeAuthProvider.fakeError = {
                error: "someerror",
                description: "There was an error"
            }
            await promise;

            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("someerror");
            expect(error.description).toEqual("There was an error");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("should only authorize 1 tenant at a time and queue the others", async () => {
            const obs1 = userAuthorization.authorize("tenant-1");
            const obs2 = userAuthorization.authorize("tenant-2");
            const tenant1Spy = jasmine.createSpy("Tenant-1");
            const tenant2Spy = jasmine.createSpy("Tenant-2");
            const p1 = obs1.then(tenant1Spy);
            const p2 = obs2.then(tenant2Spy);

            expect(tenant1Spy).not.toHaveBeenCalled();
            expect(tenant2Spy).not.toHaveBeenCalled();

            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            fakeAuthProvider.fakeToken = { accessToken: "somecode" };
            await p1;

            // Should have set tenant-1
            expect(result).not.toBeNull();
            expect(result.accessToken).toEqual("somecode");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(tenant1Spy).toHaveBeenCalled();
            expect(tenant1Spy).toHaveBeenCalledWith({
                accessToken: "somecode",
                id_token: null,
                code: null,
                session_state: null
            });

            expect(tenant2Spy).not.toHaveBeenCalled();

            // Should now authorize for tenant-2
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            await p2;

            expect(tenant2Spy).toHaveBeenCalled();
            expect(tenant2Spy).toHaveBeenCalledWith({
                accessToken: "somecode",
                id_token: null,
                code: null,
                session_state: null
            });
            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(2);
        });
    });

    describe("Authorize silently", () => {
        beforeEach(() => {
            userAuthorization.authorize("tenant-1");
        });

        it("shoud not be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(false);
        });
    });

    describe("Try Authorize silently first", () => {
        const goodResult: AuthorizeResult = { id_token: "sometoken", code: "somecode" } as any;
        const badResult: AuthorizeError = new AuthorizeError({
            error: "someerror",
            error_description: "There was an error",
        });

        let result: AuthorizeResult | null;
        let error: AuthorizeError | null;
        let callAuth: () => void;
        let authorizeOutput: jasmine.Spy;
        let promise;

        beforeEach(() => {
            result = null;
            error = null;
            callAuth = () => {
                const obs = userAuthorization.authorizeTrySilentFirst("tenant-1");
                promise = obs.then((out) => result = out).catch((e) => error = e);
            };
            userAuthorization.authorize = jasmine.createSpy("authorize").and.callFake(() => {
                return authorizeOutput();
            });
        });

        it("Should not call silent false if silent true return sucessfully", async () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValue(Promise.resolve(goodResult));
            callAuth();
            await promise;
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(1);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1");
        });
    });
});
