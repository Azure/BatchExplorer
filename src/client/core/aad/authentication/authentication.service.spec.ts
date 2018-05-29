import { AzureEnvironment } from "@batch-flask/core/azure-environment";
import { F } from "test/utils";
import { MockAuthenticationWindow, MockSplashScreen } from "test/utils/mocks/windows";
import {
    AuthenticationService, AuthenticationState, AuthorizeError, AuthorizeResult,
} from "./authentication.service";

describe("AuthenticationService", () => {
    let userAuthorization: AuthenticationService;
    let fakeAuthWindow: MockAuthenticationWindow;
    let appSpy;
    let state: AuthenticationState;
    beforeEach(() => {
        appSpy = {
            splashScreen: new MockSplashScreen(),
            authenticationWindow: new MockAuthenticationWindow(),
            azureEnvironment: AzureEnvironment.Azure,
        };
        const config = {
            tenant: "common",
            clientId: "abc",
            redirectUri: "http://localhost",
            logoutRedirectUri: "http://localhost",
        };
        userAuthorization = new AuthenticationService(appSpy, config);
        fakeAuthWindow = appSpy.authenticationWindow;
        userAuthorization.state.subscribe(x => state = x);
    });

    describe("Authorize", () => {
        let result: AuthorizeResult;
        let error: AuthorizeError;
        let promise;
        beforeEach(() => {
            result = null;
            error = null;
            const obs = userAuthorization.authorize("tenant-1");
            promise = obs.then((out) => result = out).catch((e) => error = e);
        });

        it("Should have called loadurl", () => {
            expect(fakeAuthWindow.loadURL).toHaveBeenCalledTimes(1);
            const args = fakeAuthWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
            const url = args[0];
            expect(url).toContain("https://login.microsoftonline.com/tenant-1/oauth2/authorize");
            expect(url).toContain("&resource=https://management.azure.com/");
            expect(url).toContain("?response_type=id_token+code");
            expect(url).toContain("&scope=user_impersonation+openid");
            expect(url).toContain("&client_id=abc");
            expect(url).toContain("&redirect_uri=http%3A%2F%2Flocalhost");
            expect(url).not.toContain("&prompt=none");
        });

        it("window should be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(true);
        });

        it("state should now be UserInput", () => {
            expect(state).toBe(AuthenticationState.UserInput);
        });

        it("Should return the id token and code when sucessfull", F(async () => {
            const newUrl = "http://localhost/#id_token=sometoken&code=somecode";
            fakeAuthWindow.notifyRedirect(newUrl);
            await promise;
            expect(result).not.toBeNull();
            expect(result.id_token).toEqual("sometoken");
            expect(result.code).toEqual("somecode");
            expect(error).toBeNull();

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(state).toBe(AuthenticationState.Authenticated);
        }));

        it("Should error when the url redirect returns an error", F(async () => {
            const newUrl = "http://localhost/#error=someerror&error_description=There was an error";
            fakeAuthWindow.notifyRedirect(newUrl);
            await promise;

            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("someerror");
            expect(error.error_description).toEqual("There was an error");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        }));

        it("should only authorize 1 tenant at the time and queue the others", F(async () => {
            const obs1 = userAuthorization.authorize("tenant-1");
            const obs2 = userAuthorization.authorize("tenant-2");
            const tenant1Spy = jasmine.createSpy("Tenant-1");
            const tenant2Spy = jasmine.createSpy("Tenant-2");
            const p1 = obs1.then(tenant1Spy);
            const p2 = obs2.then(tenant2Spy);

            expect(tenant1Spy).not.toHaveBeenCalled();
            expect(tenant2Spy).not.toHaveBeenCalled();

            const newUrl1 = "http://localhost/#id_token=sometoken&code=somecode";
            fakeAuthWindow.notifyRedirect(newUrl1);
            await p1;

            // Should have set tenant-1
            expect(result).not.toBeNull();
            expect(result.id_token).toEqual("sometoken");
            expect(result.code).toEqual("somecode");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(tenant1Spy).toHaveBeenCalled();
            expect(tenant1Spy).toHaveBeenCalledWith({ id_token: "sometoken", code: "somecode" });

            expect(tenant2Spy).not.toHaveBeenCalled();

            // Should now authorize for tenant-2
            const newUrl2 = "http://localhost/#id_token=sometoken2&code=somecode2";
            fakeAuthWindow.notifyRedirect(newUrl2);
            await p2;

            expect(tenant2Spy).toHaveBeenCalled();
            expect(tenant2Spy).toHaveBeenCalledWith({ id_token: "sometoken2", code: "somecode2" });
            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(2);
        }));
    });

    describe("Authorize silently", () => {
        beforeEach(() => {
            userAuthorization.authorize("tenant-1", true);
        });

        it("should set the prompt=none params", () => {
            const args = fakeAuthWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
            const url = args[0];
            expect(url).toContain("&prompt=none");
        });

        it("shoud not be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(false);
        });
    });

    describe("Try Authorize silently first", () => {
        const goodResult: AuthorizeResult = { id_token: "sometoken", code: "somecode" } as any;
        const badResult: AuthorizeError = { error: "someerror", error_description: "There was an error" };

        let result: AuthorizeResult;
        let error: AuthorizeError;
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

        it("Should not call silent false if silent true return sucessfully", F(async () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValue(Promise.resolve(goodResult));
            callAuth();
            await promise;
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(1);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", true);
        }));

        it("Should call silent false if silent true return sucessfully", async () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValues(
                Promise.reject(badResult),
                Promise.resolve(goodResult));
            callAuth();
            await promise;
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(2);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", true);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", false);
        });

        it("Should return error if both silent true and false return an error", async () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValue(Promise.reject(badResult));
            callAuth();
            await promise;

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(2);
            expect(result).toBeNull();
            expect(error).toEqual(badResult);
        });
    });
});
