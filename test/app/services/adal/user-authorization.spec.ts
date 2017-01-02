import { Observable, Subject } from "rxjs";

import {
    AuthorizeError, AuthorizeResult, UserAuthorization,
} from "app/services/adal/user-authorization";

class MockBrowserWindow {

    public loadURL = jasmine.createSpy("loadUrl");
    public show = jasmine.createSpy("show");
    public destroy = jasmine.createSpy("destroy");

    public on = jasmine.createSpy("on").and.callFake((event: string, callback: Function) => {
        if (!(event in this._events)) {
            this._events[event] = new Subject();
        }
        this._events[event].subscribe((data) => {
            callback(...data.args);
        });
    });


    public webContents = {
        on: jasmine.createSpy("webcontents.on").and.callFake((event: string, callback: Function) => {
            this.on(`webcontents.${event}`, callback);
        }),
        notify: (event: string, data: any) => {
            this.notify(`webcontents.${event}`, data);
        },
    };

    private _events: { [key: string]: Subject<any> } = {};

    public notify(event: string, args: any[]) {
        if (event in this._events) {
            this._events[event].next({ args: args });
        }
    }

}

describe("UserAuthorization", () => {
    let userAuthorization: UserAuthorization;
    let fakeWindow: MockBrowserWindow;

    beforeEach(() => {
        const config = { tenant: "common", clientId: "abc", redirectUri: "http://localhost" };
        userAuthorization = new UserAuthorization(config);
        fakeWindow = new MockBrowserWindow();
        (<any>userAuthorization)._createAuthWindow = jasmine.createSpy("CreateAuthWindow").and.returnValue(fakeWindow);
        (<any>userAuthorization)._authWindow = fakeWindow;
    });

    describe("Authorize", () => {
        let result: AuthorizeResult;
        let error: AuthorizeError;
        beforeEach(() => {
            result = null;
            error = null;
            const obs = userAuthorization.authorize();
            obs.subscribe(
                (out) => result = out,
                (e) => error = e,
            );
        });

        it("Should have called loadurl", () => {
            expect(fakeWindow.loadURL).toHaveBeenCalledTimes(1);
            const args = fakeWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
            const url = args[0];
            expect(url).toContain("https://login.microsoftonline.com/common/oauth2/authorize");
            expect(url).toContain("&resource=https://management.core.windows.net/");
            expect(url).toContain("?response_type=id_token+code");
            expect(url).toContain("&scope=user_impersonation+openid");
            expect(url).toContain("&client_id=abc");
            expect(url).toContain("&redirect_uri=http%3A%2F%2Flocalhost");
            expect(url).not.toContain("&prompt=none");
        });

        it("shoud call show", () => {
            expect(fakeWindow.show).toHaveBeenCalledTimes(1);
        });

        it("Should return the id token and code when sucessfull", () => {
            const newUrl = "http://localhost/#id_token=sometoken&code=somecode";
            fakeWindow.webContents.notify("did-get-redirect-request", [{}, "", newUrl]);
            expect(result).not.toBeNull();
            expect(result.id_token).toEqual("sometoken");
            expect(result.code).toEqual("somecode");
            expect(error).toBeNull();

            expect(fakeWindow.destroy).toHaveBeenCalledTimes(1);
        });

        it("Should error when the url redirect returns an error", () => {
            const newUrl = "http://localhost/#error=someerror&error_description=There was an error";
            fakeWindow.webContents.notify("did-get-redirect-request", [{}, "", newUrl]);
            expect(result).toBeNull();
            expect(error).not.toBeNull();
            expect(error.error).toEqual("someerror");
            expect(error.error_description).toEqual("There was an error");

            expect(fakeWindow.destroy).toHaveBeenCalledTimes(1);
        });
    });

    describe("Authorize silently", () => {
        beforeEach(() => {
            userAuthorization.authorize(true);
        });

        it("should set the prompt=none params", () => {
            const args = fakeWindow.loadURL.calls.mostRecent().args;
            expect(args.length).toBe(1);
            const url = args[0];
            expect(url).toContain("&prompt=none");
        });

        it("shoud not call show", () => {
            expect(fakeWindow.show).not.toHaveBeenCalled();
        });
    });

    describe("Try Authorize silently first", () => {
        const goodResult = { id_token: "sometoken", code: "somecode" };
        const badResult = { error: "someerror", error_description: "There was an error" };

        let result: AuthorizeResult;
        let error: AuthorizeError;
        let currentAuthObs: Observable<any>;
        let callAuth: Function;
        let authorizeOutput: jasmine.Spy;

        beforeEach(() => {
            result = null;
            error = null;
            currentAuthObs = null;
            callAuth = () => {
                const obs = userAuthorization.authorizeTrySilentFirst();
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
            expect(userAuthorization.authorize).toHaveBeenCalledWith(true);
        });

        it("Should call silent false if silent true return sucessfully", () => {
            authorizeOutput = jasmine.createSpy("output").and.returnValues(
                Observable.throw(badResult),
                Observable.of(goodResult));

            callAuth();
            expect(result).toEqual(goodResult);
            expect(error).toBeNull();

            expect(userAuthorization.authorize).toHaveBeenCalledTimes(2);
            expect(userAuthorization.authorize).toHaveBeenCalledWith(true);
            expect(userAuthorization.authorize).toHaveBeenCalledWith(false);
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
