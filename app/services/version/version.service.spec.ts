import { Constants } from "common";
import { BehaviorSubject } from "rxjs";
import { VersionService, VersionType } from "./version.service";

describe("VersionService", () => {
    let service: VersionService;
    let autoUpdateServiceSpy;
    let remoteSpy;
    let settingsServiceSpy;
    let version: string;
    let updateChannel: VersionType;

    function createService() {
        if (service) { service.ngOnDestroy(); }
        service = new VersionService(autoUpdateServiceSpy, remoteSpy, settingsServiceSpy);
        service.updateChannel.subscribe(x => updateChannel = x);
    }

    beforeEach(() => {
        version = "1.2.3";
        autoUpdateServiceSpy = {
            disable: jasmine.createSpy("autoUpdate.disable"),
            setFeedUrl: jasmine.createSpy("autoUpdate.setFeedUrl"),
        };
        remoteSpy = {
            getCurrentWindow: () => ({ batchExplorerApp: { version } }),
        };
        settingsServiceSpy = {
            settingsObs: new BehaviorSubject({}),
        };
    });

    afterEach(() => {
        if (service) {
            service.ngOnDestroy();
        }
    });

    describe("versionType", () => {
        it("Returns dev by default if no type specified in version", () => {
            version = "1.2.3";
            createService();
            expect(service.versionType).toEqual(VersionType.Dev);
        });

        it("Returns stable when version is stable", () => {
            version = "1.2.3-stable";
            createService();
            expect(service.versionType).toEqual(VersionType.Stable);
            version = "1.2.3-stable.234";
            createService();
            expect(service.versionType).toEqual(VersionType.Stable);
        });

        it("Returns insider when version is stable", () => {
            version = "1.2.3-insider";
            createService();
            expect(service.versionType).toEqual(VersionType.Insider);
            version = "1.2.3-insider.234";
            createService();
            expect(service.versionType).toEqual(VersionType.Insider);
        });

        it("Returns Testing when version is stable", () => {
            version = "1.2.3-testing";
            createService();
            expect(service.versionType).toEqual(VersionType.Testing);
            version = "1.2.3-testing.234";
            createService();
            expect(service.versionType).toEqual(VersionType.Testing);
        });
    });

    describe("update channel", () => {
        it("picks stable by default if on stable build", () => {
            version = "1.2.3-stable";
            createService();
            expect(service.versionType).toEqual(VersionType.Stable);
            expect(updateChannel).toEqual(VersionType.Stable);
        });

        it("picks insider by default if on insider build", () => {
            version = "1.2.3-insider";
            createService();
            expect(service.versionType).toEqual(VersionType.Insider);
            expect(updateChannel).toEqual(VersionType.Insider);
        });

        it("picks testing by default if on testing build", () => {
            version = "1.2.3-testing";
            createService();
            expect(service.versionType).toEqual(VersionType.Testing);
            expect(updateChannel).toEqual(VersionType.Testing);
        });

        it("picks default channel if setting provide invalid value", () => {
            version = "1.2.3-insider";
            createService();

            expect(service.versionType).toEqual(VersionType.Insider);

            settingsServiceSpy.settingsObs.next({
                "update.channel": "some-invalid",
            });
            expect(updateChannel).toEqual(VersionType.Insider);
        });

        it("picks channel provided in the settings if provided", () => {
            version = "1.2.3-insider";
            createService();

            expect(service.versionType).toEqual(VersionType.Insider);

            settingsServiceSpy.settingsObs.next({
                "update.channel": "testing",
            });
            expect(updateChannel).toEqual(VersionType.Testing);
        });

        it("update the auto update service url", () => {
            version = "1.2.3-stable";
            createService();

            expect(service.versionType).toEqual(VersionType.Stable);

            settingsServiceSpy.settingsObs.next({
                "update.channel": "insider",
            });
            expect(autoUpdateServiceSpy.setFeedUrl).toHaveBeenCalledWith(Constants.AutoUpdateUrls.insider);
        });
    });
});
