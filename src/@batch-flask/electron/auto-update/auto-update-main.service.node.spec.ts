import * as proxyquire from "proxyquire";
// import { AutoUpdateMainService } from "./auto-update-main.service";
import { UpdateStatus } from "./base";

fdescribe("AutoUdpateMainService", () => {
    let service: any;
    let autoUpdaterSpy;
    let status;

    beforeEach(async () => {
        autoUpdaterSpy = {
            checkForUpdates: jasmine.createSpy("checkForUpdates"),
            setFeedUrl: jasmine.createSpy("setFeedUrl"),
            on: () => "",
        };
        proxyquire("electron-updater", {
            autoUpdater: autoUpdaterSpy,
        });
        const { AutoUpdateMainService } = await import("./auto-update-main.service");
        service = new AutoUpdateMainService();
        service.status.subscribe(x => status = x);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    fit("it checking the status by default", () => {
        expect(status).toBe(UpdateStatus.Checking);
    });

    it("set feed url update the url and check for updates", async () => {
        await service.setFeedUrl("https://myupdateendpoint.com");
        expect(autoUpdaterSpy.setFeedUrl).toHaveBeenCalledTimes(1);
        expect(autoUpdaterSpy.setFeedUrl).toHaveBeenCalledWith("https://myupdateendpoint.com");
        expect(autoUpdaterSpy.checkForUpdates).toHaveBeenCalledTimes(1);
    })
})
