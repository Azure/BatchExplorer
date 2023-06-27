import { TelemetryType } from "@batch-flask/core";
import { TelemetryService } from "@batch-flask/core/telemetry/telemetry.service";

describe("TelemetryService", () => {
    let uploader;
    let service: TelemetryService;

    beforeEach(() => {
        uploader = {
            init: jasmine.createSpy("init"),
            track: jasmine.createSpy("track"),
        };

        service = new TelemetryService(uploader);
    });

    describe("before service is initialized", () => {
        it("shoudn't have init the uploader", () => {
            expect(uploader.init).not.toHaveBeenCalled();
        });

        it("shouldn't emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.track).not.toHaveBeenCalled();
        });

        it("shouldn't emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.track).not.toHaveBeenCalled();
        });

        it("shouldn't emit exceptions", () => {
            service.trackException({ exception: new Error() });
            expect(uploader.track).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is disabled", () => {
        beforeEach(async () => {
            await service.init(false);
        });

        it("init the uploader", () => {
            expect(uploader.init).toHaveBeenCalledOnce();
            expect(uploader.init).toHaveBeenCalledWith(false);
        });

        it("shouldn't emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.track).not.toHaveBeenCalled();
        });

        it("shouldn't emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.track).not.toHaveBeenCalled();
        });

        it("shouldn't emit exceptions", () => {
            service.trackException({ exception: new Error() });
            expect(uploader.track).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is enabled", () => {
        beforeEach(async () => {
            await service.init(true);
        });

        it("init the uploader", () => {
            expect(uploader.init).toHaveBeenCalledOnce();
            expect(uploader.init).toHaveBeenCalledWith(true);
        });

        it("emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.track).toHaveBeenCalledOnce();
            expect(uploader.track).toHaveBeenCalledWith({ name: "some-event" }, TelemetryType.Event);
        });

        it("emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.track).toHaveBeenCalledOnce();
            expect(uploader.track).toHaveBeenCalledWith({ name: "some-metric", value: 124 }, TelemetryType.Metric);
        });

        it("emit exceptions", () => {
            const error = new Error("My error");
            service.trackException({ exception: error });
            expect(uploader.track).toHaveBeenCalledOnce();
            expect(uploader.track).toHaveBeenCalledWith({ exception: error }, TelemetryType.Exception);
        });
    });
});
