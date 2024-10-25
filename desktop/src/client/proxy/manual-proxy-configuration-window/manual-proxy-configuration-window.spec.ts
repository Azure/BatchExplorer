import { ManualProxyConfigurationWindow, ProxyConfiguration } from "./manual-proxy-configuration-window";
import { BatchExplorerApplication } from "client/core";
import { BrowserWindow } from "electron";
import { ProxySetting } from "get-proxy-settings";

describe("ManualProxyConfigurationWindow", () => {
    let batchExplorerApplication: BatchExplorerApplication;
    let proxyWindow: ManualProxyConfigurationWindow;
    let browserWindow: BrowserWindow;
    let subscribeSpy;
    let unsubscribeSpy;

    beforeEach(() => {
        batchExplorerApplication = jasmine.createSpyObj(
            "BatchExplorerApplication", ["someMethod"]);
        browserWindow = jasmine.createSpyObj("BrowserWindow", ["loadURL",
            "once", "on", "hide", "close", "emit"]);
        browserWindow.loadURL = jasmine.createSpy().and.returnValue(Promise.resolve());
        proxyWindow = new ManualProxyConfigurationWindow(batchExplorerApplication);
        spyOn<any>(proxyWindow, "_initializeWindow").and.returnValue(browserWindow);
        subscribeSpy = spyOn<any>(proxyWindow, "_subscribeIpcHandlers");
        unsubscribeSpy = spyOn<any>(proxyWindow, "_unsubscribeIpcHandlers");

        browserWindow.on = jasmine.createSpy("on").and.callFake((event, handler) => {
            browserWindow[event] = handler;
        });
        browserWindow.emit = jasmine.createSpy("emit").and.callFake((event) => {
            browserWindow[event]();
        });
    });

    it("should create a new window", () => {
        const createdWindow = proxyWindow.createWindow();
        expect(createdWindow).toBe(browserWindow);
        expect(browserWindow.loadURL).toHaveBeenCalled();
        expect(browserWindow.once).toHaveBeenCalled();
    });

    it("should setup events", () => {
        const rejectSpy = spyOn<any>(proxyWindow, "rejectSettings");
        proxyWindow["_setupEvents"](browserWindow);
        expect(subscribeSpy).toHaveBeenCalled();

        browserWindow.emit("close");
        expect(unsubscribeSpy).toHaveBeenCalled();
        expect(rejectSpy).toHaveBeenCalledWith("Window was closed");
    });

    it("should process new settings", async () => {
        const config: ProxyConfiguration = {
            url: "http://example.com",
            port: "8080",
            username: "user",
            password: "pass",
        };

        const resolveSpy = spyOn<any>(proxyWindow, "resolveSettings");
        const hideSpy = spyOn(proxyWindow, "hide");
        const closeSpy = spyOn(proxyWindow, "close");

        await proxyWindow["_processNewSettings"](null, config);

        expect(hideSpy).toHaveBeenCalled();
        expect(resolveSpy).toHaveBeenCalledWith({
            http: jasmine.any(ProxySetting),
            https: jasmine.any(ProxySetting),
        });
        expect(closeSpy).toHaveBeenCalled();
    });

    it("should load proxy settings", () => {
        const proxyConfig: ProxyConfiguration = {
            url: "http://example.com",
            port: "8080",
            username: "user",
            password: "pass",
        };
        proxyWindow["proxyConfiguration"] = proxyConfig;

        const result = proxyWindow["_loadProxySettings"]();
        expect(result).toEqual(proxyConfig);
    });

    it("should reject settings if window is closed without saving", () => {
        const rejectSpy = spyOn<any>(proxyWindow, "rejectSettings");

        proxyWindow["_setupEvents"](browserWindow);
        browserWindow.emit("close");

        expect(rejectSpy).toHaveBeenCalledWith("Window was closed");
    });
});
