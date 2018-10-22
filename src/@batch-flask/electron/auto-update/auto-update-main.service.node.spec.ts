import { EventEmitter } from "events";
import * as proxyquire from "proxyquire";
import { AutoUpdateMainService } from "./auto-update-main.service";
import { UpdateStatus } from "./base";

const mock = proxyquire.noCallThru();

describe("AutoUdpateMainService", () => {
    let service: AutoUpdateMainService;
    let autoUpdaterSpy;
    let status;
    let progress;
    let emitter: EventEmitter;

    beforeEach(async () => {
        emitter = new EventEmitter();
        autoUpdaterSpy = {
            checkForUpdates: jasmine.createSpy("checkForUpdates"),
            quitAndInstall: jasmine.createSpy("quitAndInstall"),
            setFeedURL: jasmine.createSpy("setFeedUrl"),
            getFeedURL: jasmine.createSpy("getFeedUrl").and.returnValue("https://current.com"),
            on: (e, c) => emitter.on(e, c),
        };

        const { AutoUpdateMainService } = mock("./auto-update-main.service", {
            "electron-updater-fix": {
                autoUpdater: autoUpdaterSpy,
            },
        });

        service = new AutoUpdateMainService();
        service.downloadProgress.subscribe(x => progress = x);
        service.status.subscribe(x => status = x);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("it checking the status by default", () => {
        expect(status).toBe(UpdateStatus.Checking);
    });

    it("set feed url update the url and check for updates", async () => {
        await service.setFeedUrl("https://myupdateendpoint.com");
        expect(autoUpdaterSpy.setFeedURL).toHaveBeenCalledTimes(1);
        expect(autoUpdaterSpy.setFeedURL).toHaveBeenCalledWith("https://myupdateendpoint.com");
        expect(autoUpdaterSpy.checkForUpdates).toHaveBeenCalledTimes(1);
    });

    it("doesn't update the url if still the same(No check for updates)", async () => {
        await service.setFeedUrl("https://current.com");
        expect(autoUpdaterSpy.setFeedURL).not.toHaveBeenCalled();
        expect(autoUpdaterSpy.checkForUpdates).not.toHaveBeenCalled();
    });

    it("quit and install just call electron updater", async () => {
        service.quitAndInstall();
        expect(autoUpdaterSpy.quitAndInstall).toHaveBeenCalledTimes(1);
    });

    it("disable update status to no available update", async () => {
        service.disable();
        expect(status).toBe(UpdateStatus.NotAvailable);
    });

    it("update status when it receive events", () => {
        emitter.emit("checking-for-update");
        expect(status).toBe(UpdateStatus.Checking);
        emitter.emit("update-available");
        expect(status).toBe(UpdateStatus.Downloading);
        emitter.emit("download-progress", { percent: 48 });
        expect(status).toBe(UpdateStatus.Downloading);
        expect(progress).toEqual({ percent: 48 });
        emitter.emit("update-downloaded");
        expect(status).toBe(UpdateStatus.Ready);
    });
});
