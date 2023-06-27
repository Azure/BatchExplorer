import { InMemoryDataStore, TelemetryType } from "@batch-flask/core";
import { ClientConstants } from "client/client-constants";
import { TelemetryManager } from "client/core/telemetry/telemetry-manager";
import { Constants } from "common";

describe("TelemetryManager", () => {

    let processSpy;
    let telemetryServiceSpy;
    let dataStore: InMemoryDataStore;
    let manager: TelemetryManager;
    let ipcMainSpy;
    let _isDev: boolean;
    let ipcMainCallback;

    beforeEach(() => {
        telemetryServiceSpy = {
            init: jasmine.createSpy("init").and.returnValue(Promise.resolve()),
            trackEvent: jasmine.createSpy(),
            track: jasmine.createSpy(),
            flush: jasmine.createSpy("flush").and.returnValue(Promise.resolve()),
        };

        dataStore = new InMemoryDataStore();

        processSpy = {
            restart: jasmine.createSpy("restart"),
        };

        ipcMainSpy = {
            on: jasmine.createSpy("ipcMain.on").and.callFake((event, callback) => {
                ipcMainCallback = callback;
            }),
        };
        manager = new TelemetryManager(telemetryServiceSpy, dataStore as any, processSpy, ipcMainSpy);
        _isDev = ClientConstants.isDev;
    });

    afterEach(() => {
        ClientConstants.isDev = _isDev;
    });

    describe("when user has telemetry disabled", () => {
        beforeEach(() => {
            dataStore.setItem(Constants.localStorageKey.telemetryEnabled, false);
        });

        it("Disable telemetry", async () => {
            await manager.init();
            expect(manager.userTelemetryEnabled).toBe(false);
            expect(manager.telemetryEnabled).toBe(false);

            expect(telemetryServiceSpy.init).toHaveBeenCalledTimes(1);
            expect(telemetryServiceSpy.init).toHaveBeenCalledWith(false);
        });
    });

    describe("when user has telemetry enabled", () => {
        beforeEach(() => {
            dataStore.setItem(Constants.localStorageKey.telemetryEnabled, true);
        });

        it("Enable telemetry if NOT in dev mode", async () => {
            ClientConstants.isDev = false;
            await manager.init();

            expect(manager.userTelemetryEnabled).toBe(true);
            expect(manager.telemetryEnabled).toBe(true);

            expect(telemetryServiceSpy.init).toHaveBeenCalledTimes(1);
            expect(telemetryServiceSpy.init).toHaveBeenCalledWith(true);
        });

        it("Disable telemetry if in dev mode", async () => {
            ClientConstants.isDev = true;
            await manager.init();
            expect(manager.userTelemetryEnabled).toBe(true);
            expect(manager.telemetryEnabled).toBe(false);

            expect(telemetryServiceSpy.init).toHaveBeenCalledTimes(1);
            expect(telemetryServiceSpy.init).toHaveBeenCalledWith(false);
        });
    });

    describe("Disabling telemetry", () => {
        it("set the setting to disabled", async () => {
            await manager.disableTelemetry();
            const dataStoreValue = await dataStore.getItem(Constants.localStorageKey.telemetryEnabled);
            expect(dataStoreValue).toBe(false);
        });

        it("emit one last event", async () => {
            await manager.disableTelemetry();
            expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledTimes(1);
            expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledWith({
                name: Constants.TelemetryEvents.disableTelemetry,
            });
            expect(telemetryServiceSpy.flush).toHaveBeenCalledTimes(1);
        });
    });

    it("update the local setting when enabling telemetry", async () => {
        await manager.enableTelemetry();
        const dataStoreValue = await dataStore.getItem(Constants.localStorageKey.telemetryEnabled);
        expect(dataStoreValue).toBe(true);
    });

    describe("when event is sent from the renderer", () => {
        it("pass through events", () => {
            ipcMainCallback({
                telemetry: {
                    name: "My event",
                    properties: {
                        some: "value",
                    },
                },
                type: TelemetryType.Event,
            });

            expect(telemetryServiceSpy.track).toHaveBeenCalledTimes(1);
            expect(telemetryServiceSpy.track).toHaveBeenCalledWith({
                name: "My event",
                properties: {
                    some: "value",
                },
            }, TelemetryType.Event);
        });
        it("reserialize exception", () => {
            ipcMainCallback({
                telemetry: {
                    exception: {
                        name: "MyCustomError",
                        message: "My super message",
                        stack: "some-stack.js",
                    },
                },
                type: TelemetryType.Exception,
            });

            expect(telemetryServiceSpy.track).toHaveBeenCalledTimes(1);
            const args = (telemetryServiceSpy.track as jasmine.Spy).calls.mostRecent().args;

            expect(args.length).toBe(2);
            expect(args[0].exception instanceof Error).toBe(true);
            expect(args[0].exception.name).toEqual("MyCustomError");
            expect(args[0].exception.message).toEqual("My super message");
            expect(args[0].exception.stack).toEqual("some-stack.js");
            expect(args[1]).toBe(TelemetryType.Exception);
        });
    });

});
