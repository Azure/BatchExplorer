import { error } from './../../../../../../util/bux/util';
import { AccountInfo } from "@azure/msal-node";
import { delay } from "test/utils/helpers/misc";
import { MockAuthProvider } from "test/utils/mocks/auth";
import { MockAuthenticationWindow, MockSplashScreen } from "test/utils/mocks/windows";
import { AADService } from "..";
import { unretryableAuthCodeErrors } from "../aad-constants";
import {
    AuthenticationService, AuthenticationState, AuthorizeError, AuthorizeResult,
} from "./authentication.service";

const CONFIG = {
    tenant: "common",
    clientId: "abc",
    redirectUri: "http://localhost",
};

const FAKE_TOKEN = {
    accessToken: "somecode",
    account: { username: "user@contoso.com" } as AccountInfo
};

describe("AuthenticationService", () => {
    let userAuthorization: AuthenticationService;
    let fakeAuthWindow: MockAuthenticationWindow;
    let fakeAuthProvider: MockAuthProvider;
    let fakeAADService: AADService;
    let appSpy;
    let state: AuthenticationState;
    let authWindowLoaded;
    beforeEach(() => {
        appSpy = {
            splashScreen: new MockSplashScreen(),
            authenticationWindow: new MockAuthenticationWindow(),
            onIPCEvent: jasmine.createSpy("onIPCEvent"),
            sendIPCEvent: jasmine.createSpy("sendIPCEvent"),
        };
        fakeAuthProvider = new MockAuthProvider(appSpy, CONFIG);
        fakeAADService = {
            tenants: jasmine.createSpyObj("Observable", ["subscribe"])
        } as AADService;

        userAuthorization = new AuthenticationService(appSpy, CONFIG,
            fakeAuthProvider, fakeAADService);
        userAuthorization.selectUserAuthMethod =
            jasmine.createSpy("selectUserAuthMethod").and.returnValue(
                Promise.resolve({ externalBrowserAuth: false }));
        fakeAuthWindow = appSpy.authenticationWindow;
        authWindowLoaded = fakeAuthWindow.domReady;
        userAuthorization.state.subscribe(x => state = x);
    });

    describe("authorize()", () => {
        let result: AuthorizeResult | null;
        let error: AuthorizeError | null;

        beforeEach(async () => {
            result = null;
            error = null;
        });

        const runAuthorize = async (eventCallback?: () => Promise<void> | void) => {
            try {
                const promise = userAuthorization.authorize("tenant-1");

                await authWindowLoaded;

                if (eventCallback) {
                    const callbackResult = eventCallback();
                    if (callbackResult instanceof Promise) {
                        await callbackResult;
                    }
                } else {
                    await fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
                }
                result = await promise;
            } catch (_error) {
                error = _error;
            }
        };

        it("Should have called loadURL", async () => {
            await runAuthorize();

            expect(fakeAuthWindow.loadURL).toHaveBeenCalledTimes(1);
            const args = fakeAuthWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
        });

        it("window should be visible", async () => {
            await runAuthorize();
            expect(fakeAuthWindow.isVisible()).toBe(true);
        });

        it("should return the id token and code when successful", async () => {
            fakeAuthProvider.fakeToken = FAKE_TOKEN;
            await runAuthorize();

            expect(result).not.toBeNull();
            expect(result.accessToken).toEqual("somecode");
            expect(error).toBeNull();

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(state).toBe(AuthenticationState.Authenticated);
        });

        it("should error when the window fails to load", async () => {
            await runAuthorize(() =>
                fakeAuthWindow.notifyError({ code: 4, description: "Foo bar" })
            );

            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("Failed to authenticate");
            expect(error.description).toEqual("Failed to load the Microsoft login page (4:Foo bar)");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("should error when the url redirect returns an error", async () => {
            await runAuthorize(() => fakeAuthWindow.notifyError({
                code: 4, description: "out of guacamole"
            }));

            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("Failed to authenticate");
            expect(error.description).toContain("4:out of guacamole");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("should only authorize 1 tenant at a time and queue the others", async () => {
            const result1 = userAuthorization.authorize("tenant-1");
            const result2 = userAuthorization.authorize("tenant-2");
            const spy = jasmine.createSpy("multipleTenants");
            const promise1 = result1.then(spy);
            const promise2 = result2.then(spy);

            expect(spy).not.toHaveBeenCalled();

            await authWindowLoaded;

            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            fakeAuthProvider.fakeToken = FAKE_TOKEN;
            await promise1;

            result = spy.calls.mostRecent().args[0];

            // Should have set tenant-1
            expect(result).not.toBeNull();
            expect(result.accessToken).toEqual("somecode");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);

            await authWindowLoaded;

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith({
                id_token: null,
                code: null,
                session_state: null,
                state: null,
                ...FAKE_TOKEN
            });

            // Should now authorize for tenant-2
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            await promise2;

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith({
                id_token: null,
                code: null,
                session_state: null,
                state: null,
                ...FAKE_TOKEN
            });
            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(2);
        });

        it("should continue authorizing even if a tenant fails", async () => {
            fakeAuthProvider.fakeError = {
                error: "tenant1Error",
                description: "Tenant 1 Error",
                errorCodes: [ unretryableAuthCodeErrors[0] ]
            };
            const result1 = userAuthorization.authorize("tenant-1");
            const result2 = userAuthorization.authorize("tenant-2");
            const spy = jasmine.createSpy("multipleTenants");
            const promise1 = result1.then(spy);
            const promise2 = result2.then(spy);

            expect(spy).not.toHaveBeenCalled();

            await authWindowLoaded;
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);

            try {
                await promise1;
                fail("should have thrown an error");
            } catch (_error) {
                error = _error;
                expect(error.error).toEqual("tenant1Error");
            }

            // Should have set tenant-1
            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("tenant1Error");

            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(1);
            expect(spy).not.toHaveBeenCalled();

            fakeAuthProvider.fakeError = null;
            fakeAuthProvider.fakeToken = FAKE_TOKEN;

            await authWindowLoaded;

            // Should now authorize tenant-2
            fakeAuthWindow.notifyRedirect(CONFIG.redirectUri);
            await promise2;

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith({
                id_token: null,
                code: null,
                session_state: null,
                state: null,
                ...FAKE_TOKEN
            });
            expect(fakeAuthWindow.destroy).toHaveBeenCalledTimes(2);
        });
    });

    describe("Authorize silently", () => {
        beforeEach(() => {
            userAuthorization.authorize("tenant-1");
        });

        it("should not be visible", () => {
            expect(fakeAuthWindow.isVisible()).toBe(false);
        });
    });
});
