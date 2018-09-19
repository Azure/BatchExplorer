import { InMemoryDataStore } from "@batch-flask/core";
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

    beforeEach(() => {
        telemetryServiceSpy = {
            init: jasmine.createSpy("init").and.returnValue(Promise.resolve()),
            trackEvent: jasmine.createSpy(),
            flush: jasmine.createSpy("flush").and.returnValue(Promise.resolve()),
        };

        dataStore = new InMemoryDataStore();

        processSpy = {
            restart: jasmine.createSpy("restart"),
        };

        ipcMainSpy = {
            on: jasmine.createSpy("ipcMain.on"),
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
});
