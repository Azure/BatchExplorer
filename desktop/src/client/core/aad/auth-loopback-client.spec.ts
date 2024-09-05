import * as http from "http";
import { AuthLoopbackClient } from "./auth-loopback-client";
import { ServerAuthorizationCodeResponse } from "@azure/msal-node";
import { IncomingMessage, ServerResponse } from "http";

describe("AuthLoopbackClient", () => {
    let authLoopbackClient: AuthLoopbackClient;
    let serverSpy;

    beforeEach(async () => {
        authLoopbackClient = await AuthLoopbackClient.initialize(0);
    });

    afterEach(() => {
        authLoopbackClient.closeServer();
        if (serverSpy) {
            serverSpy.close();
        }
    });

    function createServerSpy(opts?: { listening?: boolean }) {
        opts = opts || {};
        if (opts.listening === undefined) {
            opts.listening = true;
        }
        serverSpy = jasmine.createSpyObj("server",
            ["listen", "close", "emit", "address"]);
        serverSpy.listen.and.returnValue({ on: () => jasmine.createSpy() });
        spyOn(http, "createServer").and.callFake((callback) => {
            serverSpy.serverCallback = callback;
            return serverSpy;
        });
        serverSpy.listening = opts.listening;
    }

    it("should initialize with preferredPort as undefined", async () => {
        const client = await AuthLoopbackClient.initialize(undefined);
        expect(client.port).toBe(0);
    });

    it("should initialize with a valid preferredPort", async () => {
        spyOn(authLoopbackClient, "isPortAvailable").and.returnValue(Promise.resolve(true));
        const client = await AuthLoopbackClient.initialize(3000);
        expect(client.port).toBe(3000);
    });

    it("should throw error if server is already initialized", () => {
        createServerSpy();
        authLoopbackClient.listenForAuthCode();
        expectAsync(authLoopbackClient.listenForAuthCode())
            .toBeRejectedWithError("Auth code listener already exists. Cannot create another.");
    });

    it("should initialize and listen for auth code", () => {
        createServerSpy();
        authLoopbackClient.listenForAuthCode();
        expect(serverSpy.listen).toHaveBeenCalled();
    });

    it("should timeout if server does not start listening", () => {
        createServerSpy({ listening: false });
        expectAsync(authLoopbackClient.listenForAuthCode())
            .toBeRejectedWithError("Timed out waiting for auth code listener to be registered.");
    });

    it("should throw error if server is not initialized in getRedirectUri", () => {
        authLoopbackClient.closeServer();
        expect(() => authLoopbackClient.getRedirectUri()).toThrowError("No auth code listener exists yet.");
    });

    it("should throw error if server address is invalid in getRedirectUri", () => {
        const serverSpy = jasmine.createSpyObj("server", ["address", "close"]);
        serverSpy.address.and.returnValue(null);
        (authLoopbackClient as any).server = serverSpy;
        expect(() => authLoopbackClient.getRedirectUri()).toThrowError("Failed to read auth code listener port");
    });

    it("should close the server", () => {
        const serverSpy = jasmine.createSpyObj("server", ["close"]);
        (authLoopbackClient as any).server = serverSpy;
        authLoopbackClient.closeServer();
        expect(serverSpy.close).toHaveBeenCalled();
    });

    it("should return true if port is available", async () => {
        const result = await authLoopbackClient.isPortAvailable(3000);
        expect(result).toBe(true);
    });

    it("should return false if port is unavailable", async () => {
        createServerSpy();
        serverSpy.listen.and.callFake(() => ({
            on: (_, callback) => callback("Uhoh")
        }));
        const result = await authLoopbackClient.isPortAvailable(3000);
        expect(result).toBe(false);
    });

    it("should return empty object for empty query in getDeserializedQueryString", () => {
        const result = AuthLoopbackClient.getDeserializedQueryString("");
        expect(result).toEqual({});
    });

    it("should return a valid redirect URI", () => {
        createServerSpy();
        serverSpy.address.and.returnValue({ port: 3000 });
        authLoopbackClient.listenForAuthCode();
        const redirectUri = authLoopbackClient.getRedirectUri();
        expect(redirectUri).toMatch(/http:\/\/localhost:\d+/);
    });

    it("should parse query string correctly", () => {
        const queryString = "code=authcode&state=state";
        const parsedObject = AuthLoopbackClient.queryStringToObject(queryString);
        expect(parsedObject).toEqual({
            code: "authcode",
            state: "state"
        });
    });

    it("should deserialize query string correctly", () => {
        const queryString = "code=authcode&state=state";
        const deserializedObject = AuthLoopbackClient.getDeserializedQueryString(queryString);
        expect(deserializedObject).toEqual({
            code: "authcode",
            state: "state"
        });
    });

    it("should check if port is available", async () => {
        const isAvailable = await authLoopbackClient.isPortAvailable(0);
        expect(isAvailable).toBe(true);
    });

    it("should listen for auth code and return the response", async () => {
        const successTemplate = "Success";
        const errorTemplate = "Error";

        createServerSpy();
        spyOn(authLoopbackClient, "getRedirectUri").and.returnValue("http://localhost:3000");

        const authCodeResponse: ServerAuthorizationCodeResponse = {
            code: "authcode",
            state: "state"
        };

        spyOn(AuthLoopbackClient, "getDeserializedQueryString").and.returnValue(authCodeResponse);

        const listenPromise = authLoopbackClient.listenForAuthCode(successTemplate, errorTemplate);

        // Simulate server behavior
        const req = { url: "/?code=authcode&state=state" } as IncomingMessage;
        const res = {
            end: jasmine.createSpy("end"),
            writeHead: jasmine.createSpy("writeHead")
        } as unknown as ServerResponse;

        // Invoke the captured callback with the mock request and response
        serverSpy.serverCallback(req, res);

        const result = await listenPromise;

        expect(result).toEqual(authCodeResponse);
        expect(res.writeHead).toHaveBeenCalledWith(302, { location: "http://localhost:3000" });
    });
});
