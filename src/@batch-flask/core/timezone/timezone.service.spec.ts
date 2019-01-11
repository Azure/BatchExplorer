import { BehaviorSubject, Subscription } from "rxjs";
import { DEFAULT_TIMEZONE, Timezone, TimezoneService } from "./timezone.service";

describe("TimezoneService", () => {
    let service: TimezoneService;
    let configSpy;
    let telemetryServiceSpy;
    let timezoneSetting: BehaviorSubject<string>;
    let current: Timezone;
    let sub: Subscription;

    beforeEach(() => {
        timezoneSetting = new BehaviorSubject<string | null>(null);
        configSpy = {
            watch: jasmine.createSpy("watch").and.returnValue(timezoneSetting),
            set: jasmine.createSpy("set"),
        };
        telemetryServiceSpy = {
            trackSetting: jasmine.createSpy("trackSetting"),
        };
        service = new TimezoneService(configSpy, telemetryServiceSpy);
        sub = service.current.subscribe(x => current = x);
    });

    afterEach(() => {
        if (sub) {
            sub.unsubscribe();
        }
    });

    it("should watch the settings", () => {
        expect(configSpy.watch).toHaveBeenCalledOnce();
        expect(configSpy.watch).toHaveBeenCalledWith("timezone");
    });

    it("default to local timezone when there is no settings", () => {
        timezoneSetting.next(null);
        expect(current).toEqual(DEFAULT_TIMEZONE);
    });

    it("default to local timezone when timezone setting is invalid", () => {
        timezoneSetting.next("foobar");
        expect(current).toEqual(DEFAULT_TIMEZONE);
        timezoneSetting.next("America/Unkown_City");
        expect(current).toEqual(DEFAULT_TIMEZONE);
    });

    it("picks UTC", () => {
        timezoneSetting.next("utc");
        expect(current).toEqual({
            name: "utc",
            offsetNameShort: "UTC",
            offsetNameLong: "UTC",
        });
    });

    it("updates the timezone", () => {
        service.setTimezone("utc");
        expect(current).toEqual({
            name: "utc",
            offsetNameShort: "UTC",
            offsetNameLong: "UTC",
        });
        expect(telemetryServiceSpy.trackSetting).toHaveBeenCalledOnce();
        expect(telemetryServiceSpy.trackSetting).toHaveBeenCalledWith("timezone", "utc");
    });
});
