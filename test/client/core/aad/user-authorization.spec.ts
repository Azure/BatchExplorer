import { Observable } from "rxjs";

import {
    AuthorizeError, AuthorizeResult, UserAuthorization,
} from "client/core/aad";
import { MockAuthenticationWindow, MockElectronRemote } from "test/utils/mocks";

describe("UserAuthorization", () => {
    let userAuthorization: UserAuthorization;
    let remoteSpy: MockElectronRemote;
    let fakeAuthWindow: MockAuthenticationWindow;

    beforeEach(() => {
        remoteSpy = new MockElectronRemote();
        const config = { tenant: "common", clientId: "abc", redirectUri: "http://localhost" };
        userAuthorization = new UserAuthorization(config, remoteSpy);
        fakeAuthWindow = remoteSpy.authenticationWindow;
    });

    describe("Authorize", () => {
        let result: AuthorizeResult;
        let error: AuthorizeError;
        beforeEach(() => {
            result = null;
            error = null;
            const obs = userAuthorization.authorize("tenant-1");
            obs.subscribe(
                (out) => result = out,
                (e) => error = e,
            );
        });

        it("Should have called loadurl", () => {
            expect(fakeAuthWindow.loadURL).toHaveBeenCalledTimes(1);
            const args = fakeAuthWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
            const url = args[0];
            expect(url).toContain("https://login.microsoftonline.com/tenant-1/oauth2/authorize");
            expect(url).toContain("&resource=https://management.core.windows.net/");
            expect(url).toContain("?response_type=id_token+code");
            expect(url).toContain("&scope=user_impersonation+openid");
            expect(url).toContain("&client_id=abc");
            expect(url).toContain("&redirect_uri=http%3A%2F%2Flocalhost");
            expect(url).not.toContain("&prompt=none");
        });

        it("window should be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(true);
        });

        it("should have hidden the splash screen", () => {
            expect(remoteSpy.splashScreen.hide).toHaveBeenCalledOnce();
        });

        it("Should return the id token and code when sucessfull", () => {
            const newUrl = "http://localhost/#id_token=sometoken&code=somecode";
            fakeAuthWindow.notifyRedirect(newUrl);
            expect(result).not.toBeNull();
            expect(result.id_token).toEqual("sometoken");
            expect(result.code).toEqual("somecode");
            expect(error).toBeNull();

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(remoteSpy.splashScreen.show).toHaveBeenCalledOnce();
        });

        it("Should error when the url redirect returns an error", () => {
            const newUrl = "http://localhost/#error=someerror&error_description=There was an error";
            fakeAuthWindow.notifyRedirect(newUrl);
            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("someerror");
            expect(error.error_description).toEqual("There was an error");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("should only authorize 1 tenant at the time and queue the others", () => {
            const obs1 = userAuthorization.authorize("tenant-1");
            const obs2 = userAuthorization.authorize("tenant-2");
            const tenant1Spy = jasmine.createSpy("Tenant-1");
            const tenant2Spy = jasmine.createSpy("Tenant-2");
            obs1.subscribe(tenant1Spy);
            obs2.subscribe(tenant2Spy);

            expect(tenant1Spy).not.toHaveBeenCalled();
            expect(tenant2Spy).not.toHaveBeenCalled();

            const newUrl1 = "http://localhost/#id_token=sometoken&code=somecode";
            fakeAuthWindow.notifyRedirect(newUrl1);

            // Should have set tenant-1
            expect(result).not.toBeNull();
            expect(result.id_token).toEqual("sometoken");
            expect(result.code).toEqual("somecode");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledOnce();
            expect(tenant1Spy).toHaveBeenCalled();
            expect(tenant1Spy).toHaveBeenCalledWith({ id_token: "sometoken", code: "somecode" });

            expect(tenant2Spy).not.toHaveBeenCalled();

            // Should now authorize for tenant-2
            const newUrl2 = "http://localhost/#id_token=sometoken2&code=somecode2";
            fakeAuthWindow.notifyRedirect(newUrl2);

            expect(tenant2Spy).toHaveBeenCalled();
            expect(tenant2Spy).toHaveBeenCalledWith({ id_token: "sometoken2", code: "somecode2" });
            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(2);
        });
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

        beforeEach(() => {
            result = null;
            error = null;
            callAuth = () => {
                const obs = userAuthorization.authorizeTrySilentFirst("tenant-1");
                obs.subscribe(
                    (out) => result = out,
                    (e) => error = e,
                );
            };
            userAuthorization.authorize = jasmine.createSpy("authorize").and.callFake(() => {
                return authorizeOutput();
            });
        });

        it("Should not call silent false if silent true return sucessfully", () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValue(Observable.of(goodResult));
            callAuth();
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledOnce();
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", true);
        });

        it("Should call silent false if silent true return sucessfully", () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValues(
                Observable.throw(badResult),
                Observable.of(goodResult));

            callAuth();
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(2);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", true);
            expect(userAuthorization.authorize).toHaveBeenCalledWith("tenant-1", false);
        });

        it("Should return error if both silent true and false return an error", () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValue(Observable.throw(badResult));
            callAuth();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(2);
            expect(result).toBeNull();
            expect(error).toEqual(badResult);
        });
    });
});
